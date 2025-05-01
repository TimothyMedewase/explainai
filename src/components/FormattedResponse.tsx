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

interface FormattedResponseProps {
  content: string;
  animateText?: boolean;
}

export function FormattedResponse({
  content,
  animateText = true,
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
    return <TextGenerateEffect words={content} />;
  }

  // Otherwise return the formatted content directly
  return <div className="formatted-response">{formattedContent}</div>;
}

function formatContent(content: string): React.ReactNode[] {
  // This will hold all our content pieces in order
  const result: React.ReactNode[] = [];

  // First, split content by code blocks, math blocks, and tables to preserve their format
  let lastIndex = 0;
  let match;

  // Find and format code blocks
  while ((match = CODE_BLOCK_REGEX.exec(content)) !== null) {
    // Add any text before this match
    if (match.index > lastIndex) {
      const textBefore = content.substring(lastIndex, match.index);
      result.push(formatTextWithInlineMath(textBefore));
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

  // Find and format math blocks
  let tempContent = content.substring(lastIndex);
  lastIndex = 0;

  while ((match = MATH_BLOCK_REGEX.exec(tempContent)) !== null) {
    // Add any text before this match
    if (match.index > lastIndex) {
      const textBefore = tempContent.substring(lastIndex, match.index);
      result.push(formatTextWithInlineMath(textBefore));
    }

    // Add the math block
    try {
      result.push(
        <div
          key={`math-block-${match.index}`}
          className="my-2 flex justify-center"
        >
          <BlockMath math={match[1]} />
        </div>
      );
    } catch (error) {
      // If math parsing fails, render as plain text
      result.push(
        <div
          key={`math-block-error-${match.index}`}
          className="my-2 bg-red-50 dark:bg-red-900/20 p-2 rounded-md"
        >
          <code>{match[0]}</code>
        </div>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Add any remaining text
  if (lastIndex < tempContent.length) {
    const remainingText = tempContent.substring(lastIndex);
    result.push(formatTextWithInlineMath(remainingText));
  }

  return result;
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
