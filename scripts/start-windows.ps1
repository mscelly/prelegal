# Build the image and start Prelegal at http://localhost:8000 with a fresh database.
$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")
docker build -t prelegal .
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
docker run -d --rm --name prelegal -p 8000:8000 --env-file .env prelegal
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host "Prelegal is running at http://localhost:8000"
