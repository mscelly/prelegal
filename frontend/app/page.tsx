import { readFileSync } from "node:fs";
import path from "node:path";
import NdaCreator from "@/components/NdaCreator";

// The templates live in the repo root so they stay the single source of truth.
// They are read once at build time and baked into the prerendered page.
const templatesDir = path.join(process.cwd(), "..", "templates");
const coverPageTemplate = readFileSync(path.join(templatesDir, "Mutual-NDA-coverpage.md"), "utf8");
const standardTermsTemplate = readFileSync(path.join(templatesDir, "Mutual-NDA.md"), "utf8");

export default function Home() {
  return (
    <NdaCreator coverPageTemplate={coverPageTemplate} standardTermsTemplate={standardTermsTemplate} />
  );
}
