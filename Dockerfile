# Build the frontend to static files.
FROM node:24-slim AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY templates /app/templates
COPY frontend ./
RUN npm run build

# Run the backend, which serves the API and the static frontend.
FROM python:3.13-slim
COPY --from=ghcr.io/astral-sh/uv:0.11 /uv /bin/uv
WORKDIR /app
ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy UV_NO_DEV=1
COPY backend/pyproject.toml backend/uv.lock ./
RUN uv sync --frozen --no-install-project
COPY backend/app ./app
COPY --from=frontend /app/frontend/out ./static
EXPOSE 8000
CMD ["uv", "run", "--no-sync", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
