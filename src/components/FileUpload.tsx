"use client";
import { FileUpload } from "@/components/ui/file-upload";
import { useFiles } from "@/lib/file-context";

export function FileUploads() {
  const { files, setFiles } = useFiles();

  const handleFileUpload = (files: File[]) => {
    setFiles(files);
  };

  const handleFileDelete = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      <div className="m-4 w-full border-2 border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg">
        <FileUpload
          onChange={handleFileUpload}
          value={files}
          onDelete={handleFileDelete}
          maxFiles={5}
        />
      </div>
    </div>
  );
}
