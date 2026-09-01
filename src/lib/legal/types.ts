/**
 * Legal documents are data, not markup.
 *
 * Keeping the copy as a structured tree buys three things a page of JSX would
 * not: the table of contents and the section anchors are derived rather than
 * hand-maintained (so they cannot drift from the headings), Terms and Privacy
 * are guaranteed to render identically, and a lawyer's redline can be applied
 * to a file that contains sentences instead of `className` strings.
 */

export type LegalBlock =
  | { type: "text"; content: string }
  | { type: "list"; items: string[] }
  /** Ordered list — use where the copy refers to steps by number. */
  | { type: "steps"; items: string[] }
  /** Pulled out of the flow. For the one point in a section a reader must not miss. */
  | { type: "callout"; title: string; content: string }
  | { type: "table"; head: string[]; rows: string[][] };

export type LegalSection = {
  /** URL fragment. Stable — external parties deep-link to these. */
  id: string;
  title: string;
  blocks: LegalBlock[];
};

export type LegalDoc = {
  title: string;
  /** One line under the title. Plain language, no defined terms. */
  summary: string;
  effectiveDate: string;
  lastUpdated: string;
  /** Shown above the table of contents, before the numbered sections begin. */
  preamble: LegalBlock[];
  sections: LegalSection[];
};
