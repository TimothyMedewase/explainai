"use client";
import { useEffect, useRef } from "react";
import { motion, stagger, useAnimate } from "motion/react";
import { cn } from "@/lib/utils";

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
  const wordsArray = words.split(" ");

  useEffect(() => {
    if (scope.current) {
      // Calculate total animation time based on number of words and stagger delay
      const staggerDelay = 0.2;
      const totalAnimationTime =
        (wordsArray.length - 1) * staggerDelay + duration;

      animate(
        "span",
        {
          opacity: 1,
          filter: filter ? "blur(0px)" : "none",
        },
        {
          duration: duration ? duration : 0.1,
          delay: stagger(staggerDelay),
        }
      );

      // Set a timeout to call onComplete after all animations should be done
      if (onComplete && !animationCompleteRef.current) {
        const timer = setTimeout(() => {
          animationCompleteRef.current = true;
          onComplete();
        }, totalAnimationTime * 1000); // Convert to milliseconds

        return () => clearTimeout(timer);
      }
    }
  }, [scope.current, animate, duration, filter, onComplete, wordsArray.length]);

  const renderWords = () => {
    return (
      <motion.div ref={scope}>
        {wordsArray.map((word, idx) => {
          return (
            <motion.span
              key={word + idx}
              className="dark:text-white text-black opacity-0"
              style={{
                filter: filter ? "blur(10px)" : "none",
              }}
            >
              {word}{" "}
            </motion.span>
          );
        })}
      </motion.div>
    );
  };

  return (
    <div className={cn(className)}>
      <div>
        <div className="dark:text-white text-black text-sm leading-snug tracking-wide">
          {renderWords()}
        </div>
      </div>
    </div>
  );
};
