"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import NdaDocument from "@/components/NdaDocument";
import NdaForm from "@/components/NdaForm";
import { defaultFormData, fillCoverPage, prepareStandardTerms, type NdaFormData } from "@/lib/nda";

type Props = {
  coverPageTemplate: string;
  standardTermsTemplate: string;
};

const noSubscription = () => () => {};

/**
 * Today's date as yyyy-mm-dd in the user's time zone. The page is prerendered
 * at build time, so the server snapshot is empty and the client fills it in.
 */
function useToday(): string {
  return useSyncExternalStore(
    noSubscription,
    () => new Date().toLocaleDateString("en-CA"),
    () => "",
  );
}

export default function NdaCreator({ coverPageTemplate, standardTermsTemplate }: Props) {
  const [formData, setFormData] = useState<NdaFormData>(defaultFormData);
  const today = useToday();

  // The effective date defaults to today until the user picks one.
  const data = { ...formData, effectiveDate: formData.effectiveDate || today };

  const coverPage = fillCoverPage(coverPageTemplate, data);
  const standardTerms = useMemo(
    () => prepareStandardTerms(standardTermsTemplate),
    [standardTermsTemplate],
  );

  function downloadPdf() {
    // The browser uses the document title as the suggested PDF file name.
    const originalTitle = document.title;
    const companies = data.parties.map((p) => p.company.trim()).filter(Boolean);
    document.title = ["Mutual NDA", ...companies].join(" - ");
    window.print();
    document.title = originalTitle;
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-slate-200 bg-white px-6 py-4 print:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Mutual NDA Creator</h1>
            <p className="text-sm text-slate-500">
              Fill in the details and download your Common Paper Mutual NDA as a PDF.
            </p>
          </div>
          <button
            type="button"
            onClick={downloadPdf}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
          >
            Download PDF
          </button>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-7xl flex-1 gap-6 p-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] print:block print:p-0">
        <section aria-label="NDA details" className="print:hidden">
          <NdaForm data={formData} defaultEffectiveDate={today} onChange={setFormData} />
        </section>
        <section aria-label="NDA preview">
          <NdaDocument coverPage={coverPage} standardTerms={standardTerms} />
        </section>
      </main>
    </div>
  );
}
