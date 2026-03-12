"use client";

import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { useState, useEffect } from "react";

const CODE_BLOCK_REGEX = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
const BLOCK_MATH_REGEX = /\$\$([\s\S]+?)\$\$/g;
const BOLD_TEXT_REGEX = /\*\*(.+?)\*\*/g;
const INLINE_MATH_REGEX = /\$(?!\$)([^$\n]+)\$/g;

interface FormattedResponseProps {
  content: string;
  animateText?: boolean;
  onAnimationComplete?: () => void;
}

type ContentBlock =
  | { type: "paragraph"; content: string }
  | { type: "heading"; level: number; content: string }
  | {
      type: "numbered-list";
      items: Array<{ number: string; content: string }>;
    }
  | { type: "bullet-list"; items: Array<string> };

export function FormattedResponse({
  content,
  animateText = false,
  onAnimationComplete,
}: FormattedResponseProps) {
  const [formattedContent, setFormattedContent] = useState<React.ReactNode[]>(
    []
  );

  useEffect(() => {
    if (!content) return;
    setFormattedContent(formatContent(content));
  }, [content]);

  if (!content) return null;

  if (animateText) {
    const enhancedContent = preformatStructuredContent(content);
    return (
      <TextGenerateEffect
        words={enhancedContent}
        onComplete={onAnimationComplete}
      />
    );
  }

  return <div className="formatted-response">{formattedContent}</div>;
}

function preformatStructuredContent(content: string): string {
  return content
    .replace(BLOCK_MATH_REGEX, (_, formula) => {
      return `<span class="math-block" data-formula="$$${formula}$$">$$${formula}$$</span>`;
    })
    .replace(INLINE_MATH_REGEX, (_, formula) => {
      return `<span class="math-inline" data-formula="$${formula}$">$${formula}$</span>`;
    })
    .replace(/^(#{1,6})\s+(.+)$/gm, (_, hashes, text) => {
      return `<span class="block my-1"><strong>${hashes} ${text}</strong></span>`;
    })
    .replace(/^(\d+)\.\s+(.+)$/gm, (_, number, item) => {
      return `<span class="block my-1"><strong>${number}.</strong> ${item}</span>`;
    })
    .replace(/^[-*•]\s+(.+)$/gm, (_, item) => {
      return `<span class="block my-1">• ${item}</span>`;
    })
    .replace(BOLD_TEXT_REGEX, "<strong>$1</strong>");
}

function formatContent(content: string): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  let lastIndex = 0;

  for (const match of content.matchAll(CODE_BLOCK_REGEX)) {
    const matchText = match[0];
    const language = match[1] || "";
    const code = match[2] || "";
    const start = match.index ?? 0;

    if (start > lastIndex) {
      result.push(
        <div key={`text-before-code-${start}`}>
          {formatStructuredText(content.slice(lastIndex, start))}
        </div>
      );
    }

    result.push(
      <pre
        key={`code-${start}`}
        className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-md my-2 overflow-x-auto"
      >
        <code className={language ? `language-${language}` : ""}>{code}</code>
      </pre>
    );

    lastIndex = start + matchText.length;
  }

  if (lastIndex < content.length) {
    result.push(
      <div key={`text-after-code-${lastIndex}`}>
        {formatStructuredText(content.slice(lastIndex))}
      </div>
    );
  }

  return result;
}

function formatStructuredText(text: string): React.ReactNode {
  const segments = splitByBlockMath(text);

  return (
    <div className="space-y-3">
      {segments.map((segment, index) => {
        if (segment.type === "math") {
          return (
            <div key={`block-math-${index}`} className="my-2 overflow-x-auto">
              <BlockMath math={segment.value} />
            </div>
          );
        }

        const contentBlocks = parseContentBlocks(segment.value);
        return contentBlocks.map((block, blockIndex) =>
          renderContentBlock(block, `${index}-${blockIndex}`)
        );
      })}
    </div>
  );
}

function splitByBlockMath(text: string): Array<{ type: "text" | "math"; value: string }> {
  const segments: Array<{ type: "text" | "math"; value: string }> = [];
  let lastIndex = 0;

  for (const match of text.matchAll(BLOCK_MATH_REGEX)) {
    const start = match.index ?? 0;
    const full = match[0];
    const formula = match[1] ?? "";

    if (start > lastIndex) {
      segments.push({ type: "text", value: text.slice(lastIndex, start) });
    }

    segments.push({ type: "math", value: formula.trim() });
    lastIndex = start + full.length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: "text", value: text.slice(lastIndex) });
  }

  return segments;
}

function renderContentBlock(block: ContentBlock, key: string): React.ReactNode {
  if (block.type === "heading") {
    const sizeByLevel = ["text-xl", "text-lg", "text-base", "text-sm", "text-sm", "text-sm"];
    const headingClass = sizeByLevel[Math.min(block.level, 6) - 1] || "text-base";

    return (
      <div key={`heading-${key}`} className={`font-semibold ${headingClass}`}>
        {formatInlineFormatting(block.content)}
      </div>
    );
  }

  if (block.type === "numbered-list") {
    return (
      <div key={`num-${key}`} className="pl-5 space-y-1">
        {block.items.map((item, itemIndex) => (
          <div key={`num-item-${key}-${itemIndex}`} className="flex items-start">
            <span className="font-semibold mr-2 mt-0.5">{item.number}.</span>
            <div className="flex-1">{formatInlineFormatting(item.content)}</div>
          </div>
        ))}
      </div>
    );
  }

  if (block.type === "bullet-list") {
    return (
      <div key={`bullet-${key}`} className="pl-5 space-y-1">
        {block.items.map((item, itemIndex) => (
          <div key={`bullet-item-${key}-${itemIndex}`} className="flex items-start">
            <span className="mr-2 mt-0.5">•</span>
            <div className="flex-1">{formatInlineFormatting(item)}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div key={`para-${key}`} className="leading-relaxed">
      {formatInlineFormatting(block.content)}
    </div>
  );
}

function parseContentBlocks(text: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  const lines = text.split("\n");

  let paragraphBuffer: string[] = [];

  const flushParagraph = () => {
    const paragraph = paragraphBuffer.join(" ").replace(/\s+/g, " ").trim();
    if (paragraph) {
      blocks.push({ type: "paragraph", content: paragraph });
    }
    paragraphBuffer = [];
  };

  const appendToLastListItem = (line: string) => {
    const normalized = line.trim();
    if (!normalized) return false;

    const lastBlock = blocks[blocks.length - 1];
    if (!lastBlock) return false;

    if (lastBlock.type === "bullet-list" && lastBlock.items.length > 0) {
      const lastIndex = lastBlock.items.length - 1;
      lastBlock.items[lastIndex] = `${lastBlock.items[lastIndex]} ${normalized}`.trim();
      return true;
    }

    if (lastBlock.type === "numbered-list" && lastBlock.items.length > 0) {
      const lastIndex = lastBlock.items.length - 1;
      const previous = lastBlock.items[lastIndex];
      lastBlock.items[lastIndex] = {
        ...previous,
        content: `${previous.content} ${normalized}`.trim(),
      };
      return true;
    }

    return false;
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flushParagraph();
      blocks.push({
        type: "heading",
        level: headingMatch[1].length,
        content: headingMatch[2].trim(),
      });
      continue;
    }

    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (numberedMatch) {
      flushParagraph();
      const lastBlock = blocks[blocks.length - 1];
      if (lastBlock?.type === "numbered-list") {
        lastBlock.items.push({
          number: numberedMatch[1],
          content: numberedMatch[2].trim(),
        });
      } else {
        blocks.push({
          type: "numbered-list",
          items: [
            {
              number: numberedMatch[1],
              content: numberedMatch[2].trim(),
            },
          ],
        });
      }
      continue;
    }

    const bulletWithTextMatch = trimmed.match(/^[-*•]\s+(.+)$/);
    if (bulletWithTextMatch) {
      flushParagraph();
      const lastBlock = blocks[blocks.length - 1];
      if (lastBlock?.type === "bullet-list") {
        lastBlock.items.push(bulletWithTextMatch[1].trim());
      } else {
        blocks.push({ type: "bullet-list", items: [bulletWithTextMatch[1].trim()] });
      }
      continue;
    }

    const bareBulletMatch = trimmed.match(/^[-*•]\s*$/);
    if (bareBulletMatch) {
      flushParagraph();
      const lastBlock = blocks[blocks.length - 1];
      if (lastBlock?.type === "bullet-list") {
        lastBlock.items.push("");
      } else {
        blocks.push({ type: "bullet-list", items: [""] });
      }
      continue;
    }

    if (appendToLastListItem(line)) {
      continue;
    }

    paragraphBuffer.push(trimmed);
  }

  flushParagraph();

  return blocks;
}

function formatInlineFormatting(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let lastBoldIndex = 0;

  for (const match of text.matchAll(BOLD_TEXT_REGEX)) {
    const start = match.index ?? 0;
    const full = match[0];
    const boldText = match[1] ?? "";

    if (start > lastBoldIndex) {
      parts.push(
        ...formatTextWithInlineMath(text.slice(lastBoldIndex, start), `plain-${start}`)
      );
    }

    parts.push(
      <strong key={`bold-${start}`}>
        {formatTextWithInlineMath(boldText, `bold-${start}`)}
      </strong>
    );

    lastBoldIndex = start + full.length;
  }

  if (lastBoldIndex < text.length) {
    parts.push(
      ...formatTextWithInlineMath(text.slice(lastBoldIndex), `plain-tail-${lastBoldIndex}`)
    );
  }

  if (parts.length === 0) {
    return formatTextWithInlineMath(text, "plain-full");
  }

  return parts;
}

function formatTextWithInlineMath(text: string, keyPrefix: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(INLINE_MATH_REGEX)) {
    const start = match.index ?? 0;
    const full = match[0];
    const formula = match[1] ?? "";

    if (start > lastIndex) {
      parts.push(text.slice(lastIndex, start));
    }

    try {
      parts.push(
        <span key={`${keyPrefix}-math-${start}`} className="inline-block align-middle">
          <InlineMath math={formula} />
        </span>
      );
    } catch {
      parts.push(
        <code key={`${keyPrefix}-math-error-${start}`}>{full}</code>
      );
    }

    lastIndex = start + full.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length ? parts : [text];
}
