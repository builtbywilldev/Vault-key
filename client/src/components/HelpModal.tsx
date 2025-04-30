import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex justify-between items-center">
          <DialogTitle>How to Use</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </DialogHeader>
        <div className="space-y-4 text-gray-700">
          <div>
            <h3 className="font-medium text-gray-800">Step 1: Enter your API Key</h3>
            <p>Enter your OpenAI API key in the provided field. This is required to process your notes.</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-800">Step 2: Paste Meeting Notes</h3>
            <p>Copy and paste your meeting transcript or notes into the text area.</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-800">Step 3: Generate Summary</h3>
            <p>Click the "Summarize Notes" button to analyze your notes using AI.</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-800">About API Keys</h3>
            <p>Your OpenAI API key is only used to process your request and is never stored on our servers.</p>
            <p className="mt-2">You can get an API key from <a href="https://platform.openai.com/account/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">OpenAI's website</a>.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
