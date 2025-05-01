import { CardWithForm } from "@/components/Card";
import { FileUploads } from "@/components/FileUpload";
import { TextArea } from "@/components/TextArea";
export default function Home() {
  return (
    <div className="m-8">
      <div className="flex col-span-2 m-4 border rounded-xl shadow-sm p-4 ">
        <FileUploads />
      </div>
      <div className="m-4">
        <TextArea />
      </div>
    </div>
  );
}
