import { Fragment, type ReactNode } from "react";
import { Link } from "react-router";

/**
 * TEMPORARY mock-only renderer: our legal-page fixtures use a Markdown string for simple
 * authoring. Real legal pages arrive as `contentHtml` (the source route renders that string
 * inside `prose` with `dangerouslySetInnerHTML`), and the Store API may expose other content
 * representations later. Swap this out for the appropriate renderer when wiring a real store.
 *
 * Supports only the subset our fixtures use: `##`/`###` headings, paragraphs, `-` lists,
 * `**bold**` and `[label](href)` links. No new dependency, no raw HTML injection.
 */
const INLINE_PATTERN = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;

function renderInline(text: string): ReactNode[] {
  return text.split(INLINE_PATTERN).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <Fragment key={index}>
          <strong>{part.slice(2, -2)}</strong>
        </Fragment>
      );
    }

    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
    if (link) {
      const label = link[1];
      const href = link[2];

      return (
        <Fragment key={index}>
          {href?.startsWith("/") ? (
            <Link to={href ?? "#"}>{label}</Link>
          ) : (
            <a href={href}>{label}</a>
          )}
        </Fragment>
      );
    }

    return <Fragment key={index}>{part}</Fragment>;
  });
}

export function MarkdownContent({ source }: { source: string }) {
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      const text = paragraph.join(" ");
      blocks.push(<p key={blocks.length}>{renderInline(text)}</p>);
      paragraph = [];
    }
  };

  const flushList = () => {
    if (list.length > 0) {
      const items = list;
      blocks.push(
        <ul key={blocks.length} className="list-disc pl-6">
          {items.map((item, index) => (
            <li key={index}>{renderInline(item)}</li>
          ))}
        </ul>,
      );
      list = [];
    }
  };

  for (const line of source.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    const heading = /^(#{2,3})\s+(.+)$/.exec(trimmed);
    if (heading) {
      flushParagraph();
      flushList();
      const content = renderInline(heading[2] ?? "");
      blocks.push(
        heading[1] === "##" ? (
          <h2 key={blocks.length}>{content}</h2>
        ) : (
          <h3 key={blocks.length}>{content}</h3>
        ),
      );
      continue;
    }

    if (trimmed.startsWith("- ")) {
      flushParagraph();
      list.push(trimmed.slice(2));
      continue;
    }

    flushList();
    paragraph.push(trimmed);
  }

  flushParagraph();
  flushList();

  return <>{blocks}</>;
}
