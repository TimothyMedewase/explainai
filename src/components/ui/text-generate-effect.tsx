"use client";
import { useEffect, useRef, useState } from "react";
import { motion, stagger, useAnimate } from "motion/react";
import { cn } from "@/lib/utils";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

// Add type declaration for KaTeX
declare global {
  interface Window {
    katex: any;
  }
}

export const TextGenerateEffect = ({
  words,
  className,
  filter = true,
  duration = 0.5,
  onComplete,
}: {
  words: string;
  className?: string;
  filter?: boolean;
  duration?: number;
  onComplete?: () => void;
}) => {
  const [scope, animate] = useAnimate();
  const animationCompleteRef = useRef(false);
  const [animationFinished, setAnimationFinished] = useState(false);
  const containsHTML = words.includes("<") && words.includes(">");
  const containsMath = words.includes("$");

  // Process HTML content into a special format for animation
  const processedContent = containsHTML
    ? processHTMLForAnimation(words)
    : words.split(" ");

  useEffect(() => {
    if (scope.current) {
      // Calculate total animation time based on number of words/segments and stagger delay
      const staggerDelay = 0.15; // Increased from 0.02 to make the animation slower
      const totalAnimationTime =
        (processedContent.length - 1) * staggerDelay + duration;

      animate(
        "span",
        {
          opacity: 1,
          filter: filter ? "blur(0px)" : "none",
        },
        {
          duration: duration ? duration : 0.15, // Slightly increased duration for each word
          delay: stagger(staggerDelay),
        }
      );

      // Set a timeout to call onComplete after all animations should be done
      if (!animationCompleteRef.current) {
        const timer = setTimeout(() => {
          animationCompleteRef.current = true;
          setAnimationFinished(true);

          // Process any math expressions in the content
          if (containsMath) {
            renderMathExpressions();
          }

          // Call the onComplete callback if provided
          if (onComplete) {
            onComplete();
          }
        }, totalAnimationTime * 1000); // Convert to milliseconds

        return () => clearTimeout(timer);
      }
    }
  }, [
    scope.current,
    animate,
    duration,
    filter,
    onComplete,
    processedContent.length,
    containsMath,
  ]);

  // Function to render math expressions after animation is complete
  const renderMathExpressions = () => {
    const mathElements = document.querySelectorAll(".math-inline, .math-block");

    mathElements.forEach((el) => {
      const formula = el.getAttribute("data-formula");
      if (!formula) return;

      try {
        if (el.classList.contains("math-inline")) {
          // Inline math
          const mathStr = formula.substring(1, formula.length - 1); // Remove $ signs
          // Use react-katex directly
          const tempDiv = document.createElement("div");
          tempDiv.className = "katex-math-inline";
          el.innerHTML = "";
          el.appendChild(tempDiv);

          // Render using KaTeX
          const katexContainer = document.createElement("span");
          katexContainer.className = "katex-display";
          tempDiv.appendChild(katexContainer);

          // Use KaTeX's auto-render if available or load formula as text
          if (window.katex) {
            window.katex.render(mathStr, katexContainer);
          } else {
            katexContainer.textContent = mathStr;
          }
        } else {
          // Block math
          const mathStr = formula.substring(2, formula.length - 2); // Remove $$ signs
          // Create a block display for the math
          const tempDiv = document.createElement("div");
          tempDiv.className = "katex-math-block my-2";
          el.innerHTML = "";
          el.appendChild(tempDiv);

          // Render using KaTeX
          const katexContainer = document.createElement("div");
          katexContainer.className = "katex-display";
          tempDiv.appendChild(katexContainer);

          // Use KaTeX's auto-render if available or load formula as text
          if (window.katex) {
            window.katex.render(mathStr, katexContainer, { displayMode: true });
          } else {
            katexContainer.textContent = mathStr;
          }
        }
      } catch (error) {
        console.error("Error rendering math:", error);
        // Keep the original math notation if rendering fails
        el.textContent = formula;
      }
    });
  };

  // Render function that works for both HTML and non-HTML content
  const renderContent = () => {
    // If animation is finished and content contains math, apply special styling
    const className =
      animationFinished && containsMath ? "math-content-rendered" : "";

    return (
      <motion.div ref={scope} className={`inline ${className}`}>
        {processedContent.map((segment, idx) => {
          // For HTML segments, use dangerouslySetInnerHTML
          if (typeof segment === "object" && segment.html) {
            return (
              <motion.span
                key={`html-${idx}`}
                className="opacity-0 inline"
                style={{
                  filter: filter ? "blur(4px)" : "none",
                }}
                dangerouslySetInnerHTML={{ __html: segment.html + " " }}
              />
            );
          }

          // For regular text segments
          return (
            <motion.span
              key={`text-${idx}`}
              className="opacity-0 inline"
              style={{
                filter: filter ? "blur(4px)" : "none",
              }}
            >
              {typeof segment === "string" ? segment : ""}{" "}
            </motion.span>
          );
        })}
      </motion.div>
    );
  };

  return (
    <div className={cn(className)}>
      <div className="dark:text-white text-black text-sm leading-relaxed tracking-wide">
        {renderContent()}
      </div>
    </div>
  );
};

// Helper function to process HTML content into animatable segments
function processHTMLForAnimation(htmlContent: string) {
  // This regex captures HTML tags and text separately
  const htmlRegex = /(<[^>]+>)|([^<>]+)/g;
  const matches = Array.from(htmlContent.matchAll(htmlRegex));

  // Group tags with their content for animation
  const segments = [];
  let currentHtmlSegment = "";

  for (const match of matches) {
    const [fullMatch, htmlTag, textContent] = match;

    if (htmlTag) {
      // This is an HTML tag, add it to current segment
      currentHtmlSegment += htmlTag;
    } else if (textContent) {
      // This is text content
      if (currentHtmlSegment) {
        // If we have accumulated HTML tags, add them to the current segment
        currentHtmlSegment += textContent;

        // Split by spaces to create animatable chunks, but preserve HTML
        const words = textContent.split(/\s+/);

        if (words.length > 1) {
          // For multi-word text inside HTML, create multiple segments
          const startTags = currentHtmlSegment.substring(
            0,
            currentHtmlSegment.indexOf(textContent)
          );
          const endTagsMatch = currentHtmlSegment.match(/<\/[^>]+>$/);
          const endTags = endTagsMatch ? endTagsMatch[0] : "";

          words.forEach((word, i) => {
            if (word) {
              segments.push({ html: `${startTags}${word}${endTags}` });
            }
          });

          currentHtmlSegment = "";
        } else {
          // For single-word or just tags, keep as one segment
          segments.push({ html: currentHtmlSegment });
          currentHtmlSegment = "";
        }
      } else {
        // No HTML tags, just split the text content by words
        const words = textContent.split(/\s+/).filter((w) => w.trim());
        segments.push(...words);
      }
    }
  }

  // Add any remaining HTML segment
  if (currentHtmlSegment) {
    segments.push({ html: currentHtmlSegment });
  }

  return segments;
}
