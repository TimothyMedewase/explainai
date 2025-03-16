import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function TextArea() {
  return (
    <div className="grid w-full gap-2">
      <Textarea placeholder="Ask me a question..." />
      <Button>Send</Button>
    </div>
  );
}
