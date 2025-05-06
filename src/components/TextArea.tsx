"use client";
import { useState } from "react";
import type React from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useFiles } from "@/lib/file-context";
import { _processFiles } from "@/lib/api";
import { toast } from "sonner";
import { FormattedResponse } from "@/components/FormattedResponse";
import { Copy } from "lucide-react";

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
  const { files } = useFiles();

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit when user presses Enter without holding Shift key
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent default behavior (new line)
      handleExplain();
    }
  };

  // Handle copy to clipboard functionality
  const handleCopy = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("Answer copied to clipboard");
      })
      .catch((error) => {
        console.error("Failed to copy:", error);
        toast.error("Failed to copy to clipboard");
      });
  };

  const handleExplain = async () => {
    if (!inputText.trim() || isGenerating) return;

    if (!files.length) {
      toast.error("Please upload at least one file before asking a question");
      return;
    }

    const userMessage: Message = {
      id: Date.now(),
      text: inputText,
      isUser: true,
    };

    const aiMessage: Message = {
      id: Date.now() + 1,
      text: "",
      isUser: false,
      isGenerating: true,
    };

    setMessages((prev) => [...prev, userMessage, aiMessage]);
    setIsGenerating(true);
    setInputText(""); // Clear input after submission

    try {
      // Process the files with the query in a single step
      toast.info("Processing files and generating response...");
      console.log("Sending files:", files);
      console.log("Sending query:", inputText);

      const response = await _processFiles(files, inputText);
      console.log("API Response:", response);

      // Extract the result from the nested response structure
      let resultText = "Sorry, I couldn't process your query.";

      // Match the specific format returned by the backend:
      // { "response": { "query": "...", "result": "..." } }
      if (response && response.response && response.response.result) {
        resultText = response.response.result;
      } else if (typeof response === "string") {
        resultText = response;
      } else if (response && response.result) {
        resultText = response.result;
      } else if (
        response &&
        response.response &&
        typeof response.response === "string"
      ) {
        resultText = response.response;
      } else if (response) {
        // Fallback: stringify the response for debugging
        resultText = JSON.stringify(response);
      }

      // Update the AI message with the response
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessage.id
            ? {
                ...msg,
                text: resultText,
                isGenerating: false,
              }
            : msg
        )
      );
    } catch (error) {
      console.error("Error processing query:", error);
      // Handle error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessage.id
            ? {
                ...msg,
                text: "Sorry, I encountered an error processing your query.",
                isGenerating: false,
              }
            : msg
        )
      );
      toast.error("Error processing your query");
    } finally {
      setIsGenerating(false);
    }
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
                    Explaining
                    <Spinner className="h-4 w-4" />
                  </span>
                </CardDescription>
              )}
              {!message.isUser && !message.isGenerating && (
                <CardAction>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopy(message.text)}
                    title="Copy to clipboard"
                    className="hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full h-8 w-8"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </CardAction>
              )}
            </CardHeader>
            <CardContent>
              {message.isUser ? (
                <p>{message.text}</p>
              ) : message.isGenerating ? (
                <></>
              ) : (
                <FormattedResponse content={message.text} />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="sticky bottom-0 p-4 bg-white dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-700">
        <div className="flex gap-2">
          <Textarea
            placeholder="Ask a question..."
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isGenerating}
            className="resize-none"
            rows={2}
          />
          <Button
            onClick={handleExplain}
            disabled={!inputText.trim() || isGenerating}
            className="self-end"
          >
            {isGenerating ? <Spinner className="h-4 w-4" /> : "Explain"}
          </Button>
        </div>
      </div>
    </div>
  );
}
