import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, CheckSquare, HelpCircle } from "lucide-react";

interface ResultsSectionProps {
  summary: string;
  actionItems: string[];
  questions: string[];
}

export default function ResultsSection({
  summary,
  actionItems,
  questions,
}: ResultsSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    if (sectionRef.current) {
      sectionRef.current.style.maxHeight = "3000px";
    }
  }, []);

  return (
    <section 
      id="resultsSection" 
      ref={sectionRef}
      className="max-h-0 overflow-hidden transition-height"
    >
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg md:text-xl font-medium mb-6 text-gray-800">Meeting Summary Results</h2>
          
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="border-l-4 border-primary p-4 bg-gray-50 rounded-r-md">
              <h3 className="font-medium text-gray-800 mb-2 flex items-center">
                <FileText className="mr-2 h-5 w-5 text-primary" />
                Summary
              </h3>
              <ScrollArea className="max-h-[200px]">
                <div className="text-gray-700">
                  {summary}
                </div>
              </ScrollArea>
            </div>
            
            {/* Action Items Card */}
            <div className="border-l-4 border-secondary p-4 bg-gray-50 rounded-r-md">
              <h3 className="font-medium text-gray-800 mb-2 flex items-center">
                <CheckSquare className="mr-2 h-5 w-5 text-secondary" />
                Action Items
              </h3>
              <ScrollArea className="max-h-[200px]">
                <ul className="list-disc pl-5 text-gray-700 space-y-1">
                  {actionItems.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </ScrollArea>
            </div>
            
            {/* Questions Card - Only show if there are questions */}
            {questions.length > 0 && (
              <div className="border-l-4 border-info p-4 bg-gray-50 rounded-r-md">
                <h3 className="font-medium text-gray-800 mb-2 flex items-center">
                  <HelpCircle className="mr-2 h-5 w-5 text-blue-500" />
                  Questions Raised
                </h3>
                <ScrollArea className="max-h-[200px]">
                  <ul className="list-disc pl-5 text-gray-700 space-y-1">
                    {questions.map((question, index) => (
                      <li key={index}>{question}</li>
                    ))}
                  </ul>
                </ScrollArea>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
