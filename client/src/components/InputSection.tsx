import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Sparkles } from "lucide-react";

interface InputSectionProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  meetingNotes: string;
  setMeetingNotes: (notes: string) => void;
  onSubmit: () => void;
}

export default function InputSection({
  apiKey,
  setApiKey,
  meetingNotes,
  setMeetingNotes,
  onSubmit,
}: InputSectionProps) {
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);

  const toggleApiKeyVisibility = () => {
    setIsApiKeyVisible(!isApiKeyVisible);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      onSubmit();
    }
  };

  return (
    <section className="mb-8">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg md:text-xl font-medium mb-4 text-gray-800">Input Your Meeting Notes</h2>
          
          <div className="mb-6">
            <Label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
              OpenAI API Key
            </Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={isApiKeyVisible ? "text" : "password"}
                placeholder="Enter your OpenAI API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={toggleApiKeyVisibility}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label={isApiKeyVisible ? "Hide API key" : "Show API key"}
              >
                {isApiKeyVisible ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Your API key is stored in your browser session only and is never saved.
            </p>
          </div>
          
          <div className="mb-6">
            <Label htmlFor="meetingNotes" className="block text-sm font-medium text-gray-700 mb-1">
              Meeting Notes
            </Label>
            <Textarea
              id="meetingNotes"
              placeholder="Paste your meeting notes or transcript here..."
              rows={8}
              value={meetingNotes}
              onChange={(e) => setMeetingNotes(e.target.value)}
              onKeyDown={handleKeyDown}
              className="resize-y"
            />
          </div>
          
          <div className="flex justify-center">
            <Button 
              onClick={onSubmit} 
              className="px-6 py-3 shadow-md"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Summarize Notes
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
