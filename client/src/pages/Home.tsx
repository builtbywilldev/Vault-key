import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InputSection from "@/components/InputSection";
import ResultsSection from "@/components/ResultsSection";
import LoadingOverlay from "@/components/LoadingOverlay";
import HelpModal from "@/components/HelpModal";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SummaryResult {
  summary: string;
  actionItems: string[];
  questions: string[];
}

export default function Home() {
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState(() => {
    return sessionStorage.getItem("openai_api_key") || "";
  });
  const [meetingNotes, setMeetingNotes] = useState("");
  const [summaryResult, setSummaryResult] = useState<SummaryResult | null>(null);
  const { toast } = useToast();

  const handleOpenHelp = () => {
    setIsHelpModalOpen(true);
  };

  const handleCloseHelp = () => {
    setIsHelpModalOpen(false);
  };

  const handleSubmit = async () => {
    // Validate inputs
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter your OpenAI API key",
        variant: "destructive",
      });
      return;
    }

    if (!meetingNotes.trim()) {
      toast({
        title: "Error",
        description: "Please enter meeting notes",
        variant: "destructive",
      });
      return;
    }

    // Save API key to session storage
    sessionStorage.setItem("openai_api_key", apiKey);

    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/summarize", {
        meetingNotes,
        apiKey,
      });
      
      const data = await response.json();
      setSummaryResult(data);
      
      // Scroll to results section
      setTimeout(() => {
        document.getElementById("resultsSection")?.scrollIntoView({
          behavior: "smooth",
        });
      }, 100);
    } catch (error) {
      console.error("Error summarizing notes:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process notes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onHelpClick={handleOpenHelp} />
      
      <main className="flex-grow container mx-auto px-4 py-6 md:py-8">
        <InputSection
          apiKey={apiKey}
          setApiKey={setApiKey}
          meetingNotes={meetingNotes}
          setMeetingNotes={setMeetingNotes}
          onSubmit={handleSubmit}
        />
        
        {summaryResult && (
          <ResultsSection 
            summary={summaryResult.summary}
            actionItems={summaryResult.actionItems}
            questions={summaryResult.questions}
          />
        )}
      </main>
      
      <Footer />
      
      {isLoading && <LoadingOverlay />}
      <HelpModal isOpen={isHelpModalOpen} onClose={handleCloseHelp} />
    </div>
  );
}
