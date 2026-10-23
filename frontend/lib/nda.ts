/**
 * Fills the Common Paper Mutual NDA templates (see /templates in the repo root)
 * with the details a user enters in the form. All functions are pure so they
 * can run on both server and client and are easy to unit test.
 */

export type Party = {
  name: string;
  title: string;
  company: string;
  noticeAddress: string;
};

export type NdaFormData = {
  purpose: string;
  /** ISO date (yyyy-mm-dd), as produced by <input type="date">. */
  effectiveDate: string;
  mndaTermType: "expires" | "untilTerminated";
  mndaTermYears: number;
  confidentialityType: "years" | "perpetual";
  confidentialityYears: number;
  governingLaw: string;
  jurisdiction: string;
  modifications: string;
  parties: [Party, Party];
};

const emptyParty: Party = { name: "", title: "", company: "", noticeAddress: "" };

export const defaultFormData: NdaFormData = {
  purpose: "Evaluating whether to enter into a business relationship with the other party.",
  effectiveDate: "",
  mndaTermType: "expires",
  mndaTermYears: 1,
  confidentialityType: "years",
  confidentialityYears: 1,
  governingLaw: "",
  jurisdiction: "",
  modifications: "",
  parties: [emptyParty, emptyParty],
};

/** Backslash-escapes characters that would otherwise be parsed as Markdown. */
export function escapeMarkdown(text: string): string {
  return text.replace(/[\\`*_{}[\]()#+\-.!|<>~=&]/g, "\\$&");
}

/** Escaped value, or a bracketed placeholder when the user left it blank. */
function field(value: string, placeholder: string): string {
  const trimmed = value.trim();
  return trimmed ? escapeMarkdown(trimmed) : `\\[${placeholder}\\]`;
}

/** Like `field`, but keeps the user's line breaks as Markdown hard breaks. */
function multilineField(value: string, placeholder: string): string {
  return field(value, placeholder).split(/\r?\n/).join("  \n");
}

/** Table cells cannot contain line breaks, so collapse them to commas. */
function cell(value: string): string {
  return escapeMarkdown(value.trim().replace(/\s*\r?\n\s*/g, ", "));
}

export function formatYears(years: number): string {
  return `${years} year${years === 1 ? "" : "s"}`;
}

/** Formats an ISO date as e.g. "October 23, 2026", independent of time zone. */
export function formatDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { timeZone: "UTC", dateStyle: "long" });
}

function checkbox(checked: boolean): string {
  return checked ? "[x]" : "[ ]";
}

/**
 * Replaces exactly one occurrence of `search`. Throws if it is missing so a
 * change to the template is caught by the tests instead of silently ignored.
 */
function replaceOnce(text: string, search: string | RegExp, replacement: string): string {
  const found = typeof search === "string" ? text.includes(search) : search.test(text);
  if (!found) throw new Error(`NDA template is missing expected text: ${search}`);
  return text.replace(search, () => replacement);
}

function fillPartyRow(text: string, label: string, values: [string, string]): string {
  return replaceOnce(
    text,
    new RegExp(`^\\| ${label}\\b.*$`, "m"),
    `| ${label} | ${cell(values[0])} | ${cell(values[1])} |`,
  );
}

export function fillCoverPage(template: string, data: NdaFormData): string {
  const [p1, p2] = data.parties;
  const expires = data.mndaTermType === "expires";
  const limited = data.confidentialityType === "years";

  let text = template;
  text = replaceOnce(
    text,
    "[Evaluating whether to enter into a business relationship with the other party.]",
    multilineField(data.purpose, "Purpose"),
  );
  text = replaceOnce(
    text,
    "[Today’s date]",
    field(formatDate(data.effectiveDate), "Effective Date"),
  );
  text = replaceOnce(
    text,
    /^- \[[ x]\] +Expires \[1 year\(s\)\] from Effective Date\.$/m,
    `- ${checkbox(expires)} Expires ${formatYears(data.mndaTermYears)} from Effective Date.`,
  );
  text = replaceOnce(
    text,
    /^- \[[ x]\] +Continues until terminated/m,
    `- ${checkbox(!expires)} Continues until terminated`,
  );
  text = replaceOnce(
    text,
    /^- \[[ x]\] +\[1 year\(s\)\] from Effective Date,/m,
    `- ${checkbox(limited)} ${formatYears(data.confidentialityYears)} from Effective Date,`,
  );
  text = replaceOnce(
    text,
    /^- \[[ x]\] +In perpetuity\.$/m,
    `- ${checkbox(!limited)} In perpetuity.`,
  );
  text = replaceOnce(text, "[Fill in state]", field(data.governingLaw, "Governing Law"));
  text = replaceOnce(
    text,
    /\[Fill in city or county and state[^\]]*\]/,
    field(data.jurisdiction, "Jurisdiction"),
  );
  text = replaceOnce(
    text,
    /^List any modifications to the MNDA$/m,
    data.modifications.trim() ? multilineField(data.modifications, "") : "None.",
  );

  text = fillPartyRow(text, "Print Name", [p1.name, p2.name]);
  text = fillPartyRow(text, "Title", [p1.title, p2.title]);
  text = fillPartyRow(text, "Company", [p1.company, p2.company]);
  text = fillPartyRow(text, "Notice Address", [p1.noticeAddress, p2.noticeAddress]);

  // Remove the form hints (<label>…</label>) meant for whoever fills in the template.
  return text.replace(/[ \t]*<label>.*?<\/label>\n?/g, "");
}

/** Turns cover page references into bold defined terms. */
export function prepareStandardTerms(template: string): string {
  return template.replace(/<span class="coverpage_link">(.*?)<\/span>/g, "**$1**");
}
