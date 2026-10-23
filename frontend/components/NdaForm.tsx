"use client";

import { useId, useState, type ReactNode } from "react";
import type { NdaFormData, Party } from "@/lib/nda";

type Props = {
  data: NdaFormData;
  /** Shown in the date picker while the user hasn't chosen an effective date. */
  defaultEffectiveDate: string;
  onChange: (data: NdaFormData) => void;
};

const MAX_YEARS = 99;

const inputClass =
  "mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500";

const partyFields: { key: keyof Party; label: string; hint?: string; rows?: number }[] = [
  { key: "name", label: "Print name" },
  { key: "title", label: "Title" },
  { key: "company", label: "Company" },
  { key: "noticeAddress", label: "Notice address", hint: "Email or postal address", rows: 2 },
];

function Fieldset({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <legend className="px-1 text-sm font-semibold text-slate-900">{legend}</legend>
      {children}
    </fieldset>
  );
}

type TextFieldProps = {
  label: string;
  hint?: string;
  placeholder?: string;
  /** Renders a textarea with this many rows instead of a single-line input. */
  rows?: number;
  value: string;
  onChange: (value: string) => void;
};

function TextField({ label, hint, placeholder, rows, value, onChange }: TextFieldProps) {
  const id = useId();
  const controlProps = {
    id,
    value,
    placeholder,
    "aria-describedby": hint ? `${id}-hint` : undefined,
    className: inputClass,
  };

  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-slate-500">
          {hint}
        </p>
      )}
      {rows ? (
        <textarea rows={rows} onChange={(e) => onChange(e.target.value)} {...controlProps} />
      ) : (
        <input type="text" onChange={(e) => onChange(e.target.value)} {...controlProps} />
      )}
    </div>
  );
}

function OptionGroup({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-slate-700">{legend}</legend>
      {children}
    </fieldset>
  );
}

function Radio({ name, checked, onSelect, children }: { name: string; checked: boolean; onSelect: () => void; children: ReactNode }) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-700">
      <input type="radio" name={name} checked={checked} onChange={onSelect} />
      {children}
    </label>
  );
}

/**
 * Keeps the raw text while the user types so that clearing the field to enter
 * a new number works; only whole numbers from 1 to MAX_YEARS are reported.
 */
function YearsInput({ label, value, onChange }: { label: string; value: number; onChange: (years: number) => void }) {
  const [draft, setDraft] = useState(String(value));

  return (
    <input
      type="number"
      min={1}
      max={MAX_YEARS}
      value={draft}
      aria-label={label}
      onChange={(e) => {
        setDraft(e.target.value);
        const years = Math.round(Number(e.target.value));
        if (e.target.value !== "" && years >= 1) onChange(Math.min(MAX_YEARS, years));
      }}
      onBlur={() => setDraft(String(value))}
      className="w-16 rounded-md border border-slate-300 px-2 py-1 text-sm"
    />
  );
}

export default function NdaForm({ data, defaultEffectiveDate, onChange }: Props) {
  function update(patch: Partial<NdaFormData>) {
    onChange({ ...data, ...patch });
  }

  function updateParty(index: number, patch: Partial<Party>) {
    const parties: [Party, Party] = [...data.parties];
    parties[index] = { ...parties[index], ...patch };
    update({ parties });
  }

  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
      <Fieldset legend="Agreement terms">
        <TextField
          label="Purpose"
          hint="How Confidential Information may be used"
          rows={3}
          value={data.purpose}
          onChange={(purpose) => update({ purpose })}
        />

        <div>
          <label htmlFor="effective-date" className="text-sm font-medium text-slate-700">
            Effective date
          </label>
          <input
            id="effective-date"
            type="date"
            value={data.effectiveDate || defaultEffectiveDate}
            onChange={(e) => update({ effectiveDate: e.target.value })}
            className={inputClass}
          />
        </div>

        <OptionGroup legend="MNDA term">
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <Radio
              name="mndaTermType"
              checked={data.mndaTermType === "expires"}
              onSelect={() => update({ mndaTermType: "expires" })}
            >
              Expires
            </Radio>
            <YearsInput
              label="MNDA term in years"
              value={data.mndaTermYears}
              onChange={(mndaTermYears) => update({ mndaTermYears, mndaTermType: "expires" })}
            />
            year(s) from the effective date
          </div>
          <Radio
            name="mndaTermType"
            checked={data.mndaTermType === "untilTerminated"}
            onSelect={() => update({ mndaTermType: "untilTerminated" })}
          >
            Continues until terminated
          </Radio>
        </OptionGroup>

        <OptionGroup legend="Term of confidentiality">
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <Radio
              name="confidentialityType"
              checked={data.confidentialityType === "years"}
              onSelect={() => update({ confidentialityType: "years" })}
            >
              For
            </Radio>
            <YearsInput
              label="Term of confidentiality in years"
              value={data.confidentialityYears}
              onChange={(confidentialityYears) => update({ confidentialityYears, confidentialityType: "years" })}
            />
            year(s) from the effective date
          </div>
          <Radio
            name="confidentialityType"
            checked={data.confidentialityType === "perpetual"}
            onSelect={() => update({ confidentialityType: "perpetual" })}
          >
            In perpetuity
          </Radio>
        </OptionGroup>

        <TextField
          label="Governing law"
          hint="State whose laws govern the MNDA"
          placeholder="e.g. Delaware"
          value={data.governingLaw}
          onChange={(governingLaw) => update({ governingLaw })}
        />
        <TextField
          label="Jurisdiction"
          hint="City or county and state of the courts"
          placeholder="e.g. courts located in New Castle, DE"
          value={data.jurisdiction}
          onChange={(jurisdiction) => update({ jurisdiction })}
        />
        <TextField
          label="Modifications"
          hint="Optional changes to the Standard Terms"
          rows={3}
          value={data.modifications}
          onChange={(modifications) => update({ modifications })}
        />
      </Fieldset>

      {data.parties.map((party, index) => (
        <Fieldset key={index} legend={`Party ${index + 1}`}>
          {partyFields.map(({ key, label, hint, rows }) => (
            <TextField
              key={key}
              label={label}
              hint={hint}
              rows={rows}
              value={party[key]}
              onChange={(value) => updateParty(index, { [key]: value })}
            />
          ))}
        </Fieldset>
      ))}
    </form>
  );
}
