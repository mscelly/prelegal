import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  defaultFormData,
  escapeMarkdown,
  fillCoverPage,
  formatDate,
  formatYears,
  prepareStandardTerms,
  type NdaFormData,
} from "./nda";

const templatesDir = path.join(import.meta.dirname, "..", "..", "templates");
const coverPage = readFileSync(path.join(templatesDir, "Mutual-NDA-coverpage.md"), "utf8");
const standardTerms = readFileSync(path.join(templatesDir, "Mutual-NDA.md"), "utf8");

const filled: NdaFormData = {
  ...defaultFormData,
  purpose: "Exploring a joint venture.",
  effectiveDate: "2026-03-01",
  mndaTermYears: 2,
  confidentialityYears: 3,
  governingLaw: "Delaware",
  jurisdiction: "courts located in New Castle, DE",
  modifications: "Section 6 does not apply.",
  parties: [
    { name: "Ada Lovelace", title: "CEO", company: "Analytical Ltd", noticeAddress: "ada@example.com" },
    { name: "Alan Turing", title: "CTO", company: "Enigma Inc", noticeAddress: "alan@example.com" },
  ],
};

describe("fillCoverPage", () => {
  it("fills in the deal terms", () => {
    const result = fillCoverPage(coverPage, filled);

    expect(result).toContain("Exploring a joint venture\\.");
    expect(result).toContain("March 1, 2026");
    expect(result).toContain("- [x] Expires 2 years from Effective Date.");
    expect(result).toContain("- [ ] Continues until terminated");
    expect(result).toContain("- [x] 3 years from Effective Date,");
    expect(result).toContain("- [ ] In perpetuity.");
    expect(result).toContain("Governing Law: Delaware");
    expect(result).toContain("Jurisdiction: courts located in New Castle, DE");
    expect(result).toContain("Section 6 does not apply\\.");
  });

  it("fills in both parties and leaves signature and date blank", () => {
    const result = fillCoverPage(coverPage, filled);

    expect(result).toContain("| Print Name | Ada Lovelace | Alan Turing |");
    expect(result).toContain("| Title | CEO | CTO |");
    expect(result).toContain("| Company | Analytical Ltd | Enigma Inc |");
    expect(result).toContain("| Notice Address | ada@example\\.com | alan@example\\.com |");
    expect(result).toContain("| Signature | | |");
    expect(result).toContain("| Date | | |");
  });

  it("checks the open-ended options", () => {
    const result = fillCoverPage(coverPage, {
      ...filled,
      mndaTermType: "untilTerminated",
      confidentialityType: "perpetual",
    });

    expect(result).toContain("- [ ] Expires 2 years from Effective Date.");
    expect(result).toContain("- [x] Continues until terminated");
    expect(result).toContain("- [ ] 3 years from Effective Date,");
    expect(result).toContain("- [x] In perpetuity.");
  });

  it("shows placeholders for blank fields", () => {
    const result = fillCoverPage(coverPage, defaultFormData);

    expect(result).toContain("\\[Effective Date\\]");
    expect(result).toContain("Governing Law: \\[Governing Law\\]");
    expect(result).toContain("Jurisdiction: \\[Jurisdiction\\]");
    expect(result).toContain("None.");
  });

  it("removes template hints and leftover placeholders", () => {
    const result = fillCoverPage(coverPage, filled);

    expect(result).not.toContain("<label>");
    expect(result).not.toContain("[Fill in");
    expect(result).not.toContain("year(s)");
  });

  it("escapes user input so it cannot break the table", () => {
    const result = fillCoverPage(coverPage, {
      ...filled,
      parties: [
        { ...filled.parties[0], company: "A | B" },
        { ...filled.parties[1], noticeAddress: "1 Main St\nSpringfield" },
      ],
    });

    expect(result).toContain("| Company | A \\| B | Enigma Inc |");
    expect(result).toContain("| Notice Address | ada@example\\.com | 1 Main St, Springfield |");
  });
});

describe("prepareStandardTerms", () => {
  it("turns cover page links into bold defined terms", () => {
    const result = prepareStandardTerms(standardTerms);

    expect(result).not.toContain("<span");
    expect(result).toContain("solely for the **Purpose**");
    expect(result).toContain("laws of the State of **Governing Law**");
  });
});

describe("helpers", () => {
  it("formats years", () => {
    expect(formatYears(1)).toBe("1 year");
    expect(formatYears(5)).toBe("5 years");
  });

  it("formats dates and rejects invalid ones", () => {
    expect(formatDate("2026-12-31")).toBe("December 31, 2026");
    expect(formatDate("")).toBe("");
  });

  it("escapes markdown syntax", () => {
    expect(escapeMarkdown("**bold** [link](x)")).toBe("\\*\\*bold\\*\\* \\[link\\]\\(x\\)");
    expect(escapeMarkdown("===")).toBe("\\=\\=\\=");
    expect(escapeMarkdown("&copy;")).toBe("\\&copy;");
  });
});
