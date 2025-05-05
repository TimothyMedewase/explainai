"use client";

import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { useState, useEffect } from "react";

// Regex patterns for detecting different content types
const MATH_INLINE_REGEX = /\$([^\$]+)\$/g;
const MATH_BLOCK_REGEX = /\$\$([^\$]+)\$\$/g;
const CODE_BLOCK_REGEX = /```([a-zA-Z0-9]*)\n([\s\S]*?)```/g;
const TABLE_REGEX = /\|(.+)\|\n\|([-:]+\|)+\n((?:\|.+\|\n)+)/g;

// Enhanced formatting regex patterns
const NUMBERED_LIST_ITEM_REGEX = /^(\d+)\.\s+(.+)$/gm;
const BULLET_POINT_REGEX = /^[-*]\s+(.+)$/gm;
const BOLD_TEXT_REGEX = /\*\*(.+?)\*\*/g;
const HEADING_REGEX = /^(#+)\s+(.+)$/gm;

interface FormattedResponseProps {
  content: string;
  animateText?: boolean;
  onAnimationComplete?: () => void;
}

export function FormattedResponse({
  content,
  animateText = true,
  onAnimationComplete,
}: FormattedResponseProps) {
  const [formattedContent, setFormattedContent] = useState<React.ReactNode[]>(
    []
  );

  useEffect(() => {
    if (!content) return;

    const processedContent = formatContent(content);
    setFormattedContent(processedContent);
  }, [content]);

  if (!content) return null;

  // If we're using animation, wrap the formatted content in TextGenerateEffect
  if (animateText) {
    // Create a custom formatter for animated text that preserves structure
    const enhancedContent = preformatStructuredContent(content);
    return (
      <TextGenerateEffect
        words={enhancedContent}
        onComplete={onAnimationComplete}
      />
    );
  }

  // Otherwise return the formatted content directly
  return <div className="formatted-response">{formattedContent}</div>;
}

// Helper function to preformat structured content for text animation
function preformatStructuredContent(content: string): string {
  // First handle math expressions before other formatting
  let formattedContent = content
    // Format block math expressions
    .replace(MATH_BLOCK_REGEX, (match, formula) => {
      return `<span class="math-block" data-formula="$$${formula}$$">$$${formula}$$</span>`;
    })
    // Format inline math expressions
    .replace(MATH_INLINE_REGEX, (match, formula) => {
      return `<span class="math-inline" data-formula="$${formula}$">$${formula}$</span>`;
    });

  // Then apply HTML formatting to structured content
  formattedContent = formattedContent
    // Format numbered lists (1. Item -> HTML ordered list)
    .replace(/(\d+)\.\s+(.+?)(?=\n\d+\.|$)/g, (match, number, item) => {
      return `<span class="block my-1"><strong>${number}.</strong> ${item}</span>`;
    })
    // Format bullet points
    .replace(/^[-*]\s+(.+)$/gm, (match, item) => {
      return `<span class="block my-1">• ${item}</span>`;
    })
    // Format bold text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // Format simple indentation (for nested lists)
    .replace(/^(\s{2,})(.+)$/gm, (match, indent, text) => {
      const indentLevel = Math.floor(indent.length / 2);
      const paddingLeft = indentLevel * 1.5;
      return `<span class="block pl-${paddingLeft}">${text}</span>`;
    });

  return formattedContent;
}

function formatContent(content: string): React.ReactNode[] {
  // This will hold all our content pieces in order
  const result: React.ReactNode[] = [];

  // Process the content in stages to handle different formatting needs

  // Stage 1: Extract and format code blocks first
  let processedContent = content;
  let lastIndex = 0;
  let match;

  // Extract code blocks
  while ((match = CODE_BLOCK_REGEX.exec(content)) !== null) {
    // Add any text before this match
    if (match.index > lastIndex) {
      const textBefore = content.substring(lastIndex, match.index);
      result.push(formatStructuredText(textBefore));
    }

    const language = match[1] || "";
    const code = match[2];

    // Add the code block
    result.push(
      <pre
        key={`code-${match.index}`}
        className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-md my-2 overflow-x-auto"
      >
        <code className={language ? `language-${language}` : ""}>{code}</code>
      </pre>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add any remaining text after code blocks
  if (lastIndex < content.length) {
    const remainingText = content.substring(lastIndex);
    result.push(formatStructuredText(remainingText));
  }

  return result;
}

// Process text with structured formatting (lists, bold text, etc.)
function formatStructuredText(text: string): React.ReactNode {
  // Enhanced content parsing - identify different blocks of content
  const contentBlocks = parseContentBlocks(text);

  return (
    <div className="space-y-2">
      {contentBlocks.map((block, index) => {
        if (block.type === "numbered-list") {
          // Render numbered list
          return (
            <div key={`list-${index}`} className="pl-5 space-y-1">
              {(block.items as Array<{ number: string; content: string }>).map(
                (item, itemIndex) => (
                  <div key={`item-${itemIndex}`} className="flex items-start">
                    <span className="font-bold mr-2 mt-1">{item.number}.</span>
                    <div className="flex-1">{formatInlineFormatting(item.content)}</div>
                  </div>
                )
              )}
            </div>
          );
        } else if (block.type === "bullet-list") {
          // Render bullet list
          return (
            <div key={`bullet-${index}`} className="pl-5 space-y-1">
              {(block.items as Array<string>).map((item, itemIndex) => (
                <div key={`bullet-${itemIndex}`} className="flex items-start">
                  <span className="mr-2 mt-1">•</span>
                  <div className="flex-1">{formatInlineFormatting(item)}</div>
                </div>
              ))}
            </div>
          );
        } else {
          // Render paragraph with inline formatting
          return (
            <div key={`para-${index}`} className="mb-4">
              {formatInlineFormatting(block.content as string)}
            </div>
          );
        }
      })}
    </div>
  );
}

// Process inline formatting (bold, math, etc.) within text blocks
function formatInlineFormatting(text: string): React.ReactNode[] {
  const elements: React.ReactNode[] = [];

  // First handle bold text
  let lastBoldIndex = 0;
  let boldMatch;
  const boldResults: React.ReactNode[] = [];

  // Find bold text patterns
  while ((boldMatch = BOLD_TEXT_REGEX.exec(text)) !== null) {
    // Add any text before the bold text
    if (boldMatch.index > lastBoldIndex) {
      boldResults.push(
        formatTextWithInlineMath(text.substring(lastBoldIndex, boldMatch.index))
      );
    }

    // Add the bold text
    boldResults.push(
      <strong key={`bold-${boldMatch.index}`}>
        {formatTextWithInlineMath(boldMatch[1])}
      </strong>
    );

    lastBoldIndex = boldMatch.index + boldMatch[0].length;
  }

  // Add any text after the last bold match
  if (lastBoldIndex < text.length) {
    boldResults.push(formatTextWithInlineMath(text.substring(lastBoldIndex)));
  }

  return boldResults.length ? boldResults : [text];
}

// Helper function to parse content into structured blocks
function parseContentBlocks(text: string): Array<{
  type: "numbered-list" | "bullet-list" | "paragraph";
  items?: Array<{ number: string; content: string }> | Array<string>;
  content?: string;
}> {
  const blocks: Array<{
    type: "numbered-list" | "bullet-list" | "paragraph";
    items?: Array<{ number: string; content: string }> | Array<string>;
    content?: string;
  }> = [];
  const lines = text.split("\n");
  let currentBlock: {
    type: "numbered-list" | "bullet-list" | "paragraph";
    items: Array<{ number: string; content: string }> | Array<string>;
    content?: string;
  } | null = null;

  lines.forEach((line) => {
    // Check for numbered list item
    const numberedMatch = line.match(/^(\d+)\.\s+(.+)$/);
    if (numberedMatch) {
      if (!currentBlock || currentBlock.type !== "numbered-list") {
        // Start a new numbered list block
        currentBlock = { type: "numbered-list", items: [] };
        blocks.push(currentBlock);
      }
      (currentBlock.items as Array<{ number: string; content: string }>).push({
        number: numberedMatch[1],
        content: numberedMatch[2],
      });
      return;
    }

    // Check for bullet list item
    const bulletMatch = line.match(/^[-*]\s+(.+)$/);
    if (bulletMatch) {
      if (!currentBlock || currentBlock.type !== "bullet-list") {
        // Start a new bullet list block
        currentBlock = { type: "bullet-list", items: [] };
        blocks.push(currentBlock);
      }
      (currentBlock.items as Array<string>).push(bulletMatch[1]);
      return;
    }

    // Handle regular paragraph text
    if (line.trim()) {
      blocks.push({ type: "paragraph", content: line });
      currentBlock = null;
    }
  });

  return blocks;
}

// Helper function to handle inline math within text
function formatTextWithInlineMath(text: string): React.ReactNode {
  if (!text.includes("$")) return text;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = MATH_INLINE_REGEX.exec(text)) !== null) {
    // Skip if this is actually part of a block math that wasn't handled properly
    if (match[0].startsWith("$$")) continue;

    // Add text before this inline math
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    // Add the inline math
    try {
      parts.push(
        <span
          key={`inline-math-${match.index}`}
          className="inline-block align-middle"
        >
          <InlineMath math={match[1]} />
        </span>
      );
    } catch (error) {
      // If math parsing fails, render as plain text
      parts.push(
        <code key={`inline-math-error-${match.index}`}>{match[0]}</code>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Add any text after the last inline math
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return <>{parts}</>;
}
