import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

const remarkPlugins = [remarkGfm];

// Native disabled checkboxes print faintly, so render task list boxes as text.
const components: Components = {
  input: ({ checked }) => (
    <span role="img" aria-label={checked ? "Selected" : "Not selected"}>
      {checked ? "☒" : "☐"}
    </span>
  ),
};

type Props = {
  coverPage: string;
  standardTerms: string;
};

export default function NdaDocument({ coverPage, standardTerms }: Props) {
  return (
    <article className="nda-document prose prose-slate max-w-none rounded-lg border border-slate-200 bg-white p-8 shadow-sm lg:p-12 print:border-0 print:p-0 print:shadow-none">
      <Markdown remarkPlugins={remarkPlugins} components={components}>{coverPage}</Markdown>
      <div className="mt-12 border-t border-slate-200 pt-8 print:mt-0 print:break-before-page print:border-0 print:pt-0">
        <Markdown remarkPlugins={remarkPlugins} components={components}>{standardTerms}</Markdown>
      </div>
    </article>
  );
}
