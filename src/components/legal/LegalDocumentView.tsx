import React from "react";
import Link from "next/link";
import { Playfair_Display } from "next/font/google";
import type { LegalBlock, LegalDoc } from "@/lib/legal/types";
import { cn } from "@/lib/utils";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700"] });

/**
 * Minimal inline formatter for `**bold**` and `[label](href)`.
 *
 * Legal copy needs emphasis and cross-references, and nothing else — so this
 * is a 20-line splitter rather than a markdown dependency. Anything it does
 * not recognise passes through as literal text, which is the safe failure for
 * a document where a mangled sentence is worse than an unstyled one.
 */
const INLINE = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;

const renderInline = (text: string): React.ReactNode =>
  text.split(INLINE).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold text-[#0f2f2a]">
          {part.slice(2, -2)}
        </strong>
      );
    }

    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
    if (link) {
      const [, label, href] = link;
      const external = href.startsWith("http") || href.startsWith("mailto:");
      return external ? (
        <a
          key={index}
          href={href}
          className="font-medium text-[#0f2f2a] underline decoration-[#d09a25] decoration-2 underline-offset-4 hover:text-[#d09a25]"
          {...(href.startsWith("http")
            ? { target: "_blank", rel: "noreferrer noopener" }
            : {})}
        >
          {label}
        </a>
      ) : (
        <Link
          key={index}
          href={href}
          className="font-medium text-[#0f2f2a] underline decoration-[#d09a25] decoration-2 underline-offset-4 hover:text-[#d09a25]"
        >
          {label}
        </Link>
      );
    }

    return <React.Fragment key={index}>{part}</React.Fragment>;
  });

const Block: React.FC<{ block: LegalBlock }> = ({ block }) => {
  switch (block.type) {
    case "text":
      return (
        <p className="text-[15px] leading-7 text-slate-600">
          {renderInline(block.content)}
        </p>
      );

    case "list":
      return (
        <ul className="space-y-2.5">
          {block.items.map((item, index) => (
            <li
              key={index}
              className="relative pl-6 text-[15px] leading-7 text-slate-600 before:absolute before:left-0 before:top-[13px] before:h-1.5 before:w-1.5 before:rounded-full before:bg-[#d09a25]"
            >
              {renderInline(item)}
            </li>
          ))}
        </ul>
      );

    case "steps":
      return (
        <ol className="space-y-3">
          {block.items.map((item, index) => (
            <li key={index} className="flex gap-3.5 text-[15px] leading-7 text-slate-600">
              <span
                aria-hidden
                className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0f2f2a] text-xs font-semibold text-[#fdfbf7]"
              >
                {index + 1}
              </span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ol>
      );

    case "callout":
      return (
        <div className="rounded-2xl border border-[#e8dcc2] bg-[#f7f2ea] p-5">
          <p className="text-sm font-semibold tracking-wide text-[#0f2f2a] uppercase">
            {block.title}
          </p>
          <p className="mt-2 text-[15px] leading-7 text-slate-700">
            {renderInline(block.content)}
          </p>
        </div>
      );

    case "table":
      return (
        // Wide tables scroll inside their own box rather than pushing the page sideways on mobile.
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full min-w-[520px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-[#f7f2ea]">
                {block.head.map((cell) => (
                  <th
                    key={cell}
                    className="px-4 py-3 font-semibold text-[#0f2f2a]"
                    scope="col"
                  >
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-t border-slate-200">
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="px-4 py-3 align-top leading-6 text-slate-600"
                    >
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
};

const Blocks: React.FC<{ blocks: LegalBlock[]; className?: string }> = ({
  blocks,
  className,
}) => (
  <div className={cn("space-y-4", className)}>
    {blocks.map((block, index) => (
      <Block key={index} block={block} />
    ))}
  </div>
);

const LegalDocumentView: React.FC<{ doc: LegalDoc }> = ({ doc }) => (
  <div className="bg-white">
    <header className="border-b border-[#e8dcc2] bg-[#f7f2ea]">
      <div className="mx-auto w-full max-w-6xl px-6 py-14 md:py-20">
        <p className="text-xs font-semibold tracking-[0.2em] text-[#d09a25] uppercase">
          Legal
        </p>
        <h1
          className={cn(
            playfair.className,
            "mt-3 text-4xl leading-tight text-[#0f2f2a] md:text-5xl",
          )}
        >
          {doc.title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
          {doc.summary}
        </p>
        <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-3 text-sm">
          <div>
            <dt className="text-slate-500">Effective</dt>
            <dd className="font-semibold text-[#0f2f2a]">{doc.effectiveDate}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Last updated</dt>
            <dd className="font-semibold text-[#0f2f2a]">{doc.lastUpdated}</dd>
          </div>
        </dl>
      </div>
    </header>

    <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-12 md:py-16 lg:grid-cols-[260px_1fr] lg:gap-16">
      {/* Sidebar first in the DOM so keyboard and screen-reader users reach the
          section index before wading through the body. */}
      <nav aria-label="On this page" className="lg:sticky lg:top-8 lg:self-start">
        <p className="text-xs font-semibold tracking-[0.15em] text-slate-500 uppercase">
          On this page
        </p>
        <ol className="mt-4 space-y-2.5 border-l border-slate-200 lg:max-h-[70vh] lg:overflow-y-auto">
          {doc.sections.map((section, index) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="-ml-px block border-l-2 border-transparent py-0.5 pl-4 text-sm leading-6 text-slate-600 transition-colors hover:border-[#d09a25] hover:text-[#0f2f2a]"
              >
                <span className="text-slate-400">{index + 1}.</span>{" "}
                {section.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <article className="min-w-0">
        <Blocks blocks={doc.preamble} className="space-y-4 pb-4" />

        <div className="mt-10 space-y-12">
          {doc.sections.map((section, index) => (
            <section
              key={section.id}
              id={section.id}
              // Anchored headings must clear the sticky header when jumped to.
              className="scroll-mt-24"
            >
              <h2
                className={cn(
                  playfair.className,
                  "text-2xl leading-snug text-[#0f2f2a] md:text-[28px]",
                )}
              >
                <span className="mr-2 text-[#d09a25]">{index + 1}.</span>
                {section.title}
              </h2>
              <Blocks blocks={section.blocks} className="mt-5 space-y-4" />
            </section>
          ))}
        </div>
      </article>
    </div>
  </div>
);

export default LegalDocumentView;
