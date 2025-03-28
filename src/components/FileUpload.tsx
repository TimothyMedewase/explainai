"use client";
import { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";

export function FileUploads() {
  const [files, setFiles] = useState<File[]>([]);

  const handleFileUpload = (files: File[]) => {
    setFiles(files);
    console.log(files);
  };

  const handleFileDelete = (index: number) => {
    console.log(`File at index ${index} deleted`);
  };

  return (
    <div className="m-4 w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg">
      <FileUpload
        onChange={handleFileUpload}
        value={files}
        onDelete={handleFileDelete}
        maxFiles={5}
      />
    </div>
  );
}
