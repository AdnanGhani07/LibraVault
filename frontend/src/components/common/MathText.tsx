"use client";

import katex from "katex";
import { useMemo } from "react";

interface MathTextProps {
  text: string;
  className?: string;
}

/**
 * Parses raw academic text containing LaTeX formatting:
 * - Block math: \[ ... \] or $$ ... $$
 * - Inline math: \( ... \) or $ ... $
 * - LaTeX typographical dashes: -- and ---
 */
export function MathText({ text, className = "" }: MathTextProps) {
  const renderedHtml = useMemo(() => {
    if (!text) return "";

    // 1. Normalize linebreaks and typographical dashes outside of math
    let content = text.replace(/---/g, "—").replace(/--/g, "–");

    // 2. Render block/display math \[ ... \] or $$ ... $$
    content = content.replace(
      /(\\\[([\s\S]*?)\\\]|\$\$([\s\S]*?)\$\$)/g,
      (_, _full, m1, m2) => {
        const expr = (m1 || m2 || "").trim();
        try {
          const rendered = katex.renderToString(expr, {
            displayMode: true,
            throwOnError: false,
          });
          return `<div class="katex-display-wrapper my-2.5 overflow-x-auto text-center py-1">${rendered}</div>`;
        } catch {
          return `<pre class="text-indigo-300 font-mono text-xs my-1">${expr}</pre>`;
        }
      },
    );

    // 3. Render inline math \( ... \) or $ ... $
    content = content.replace(
      /(\\\(([\s\S]*?)\\\)|\$([^\$\n]+?)\$)/g,
      (_, _full, m1, m2) => {
        const expr = (m1 || m2 || "").trim();
        try {
          return katex.renderToString(expr, {
            displayMode: false,
            throwOnError: false,
          });
        } catch {
          return `<span class="font-mono text-indigo-300">${expr}</span>`;
        }
      },
    );

    return content;
  }, [text]);

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
}
