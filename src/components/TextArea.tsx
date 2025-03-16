"use client";
import { useState } from "react";
import type React from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

type Message = {
  id: number;
  text: string;
  isUser: boolean;
  isGenerating?: boolean;
};

export function TextArea() {
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  const handleExplain = () => {
    if (!inputText.trim() || isGenerating) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputText,
      isUser: true,
    };

    const aiMessage: Message = {
      id: Date.now() + 1,
      text: inputText, // Using the same text for AI response
      isUser: false,
      isGenerating: true,
    };

    setMessages((prev) => [...prev, userMessage, aiMessage]);
    setIsGenerating(true);
    setInputText(""); // Clear input after submission
  };

  const handleGenerationComplete = () => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.isGenerating ? { ...msg, isGenerating: false } : msg
      )
    );
    setIsGenerating(false);
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <Card key={message.id} className={`w-full ${message.isUser}`}>
            <CardHeader>
              <CardTitle>{message.isUser ? "You" : "Answer"}</CardTitle>
              {!message.isUser && message.isGenerating && (
                <CardDescription>
                  <span className="flex items-center gap-2">
                    Explaining <Spinner className="h-4 w-4" />
                  </span>
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {message.isUser ? (
                <p>{message.text}</p>
              ) : (
                <TextGenerateEffect
                  words={message.text}
                  onComplete={handleGenerationComplete}
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="sticky bottom-0 p-4  border-t">
        <div className="flex gap-2">
          <Textarea
            placeholder="Ask me a question..."
            value={inputText}
            onChange={handleInputChange}
            disabled={isGenerating}
            className="resize-none"
            rows={2}
          />
          <Button
            onClick={handleExplain}
            disabled={!inputText.trim() || isGenerating}
            className="self-end"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                Explaining <Spinner className="h-4 w-4" />
              </span>
            ) : (
              "Explain"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
