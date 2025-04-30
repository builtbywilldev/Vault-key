import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// Passphrase generation form schema
const passphraseFormSchema = z.object({
  words: z.number().int().min(3).max(12).default(4),
  separator: z.string().max(3).default("-"),
  capitalize: z.boolean().default(false),
  includeNumber: z.boolean().default(false)
});

type PassphraseFormValues = z.infer<typeof passphraseFormSchema>;

export default function PassphraseGenerator() {
  const [passphrase, setPassphrase] = useState<string>("");
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  // Initialize form with default values
  const form = useForm<PassphraseFormValues>({
    resolver: zodResolver(passphraseFormSchema),
    defaultValues: {
      words: 4,
      separator: "-",
      capitalize: false,
      includeNumber: false
    },
  });

  // Handle form submission
  const onSubmit = async (data: PassphraseFormValues) => {
    try {
      setIsLoading(true);
      const result = await apiRequest(
        "POST",
        "/api/generate-passphrase",
        data
      );
      
      const response = await result.json();
      setPassphrase(response.password);
      setIsCopied(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate passphrase. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Copy passphrase to clipboard
  const copyToClipboard = () => {
    if (!passphrase) return;
    
    navigator.clipboard.writeText(passphrase)
      .then(() => {
        setIsCopied(true);
        toast({
          title: "Copied!",
          description: "Passphrase copied to clipboard",
        });
        
        // Reset the copied state after 2 seconds
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Failed to copy passphrase to clipboard",
          variant: "destructive",
        });
      });
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Passphrase Generator</CardTitle>
        <CardDescription>
          Generate a memorable passphrase using random words
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Passphrase Output */}
        {passphrase && (
          <div className="relative">
            <div className="flex items-center justify-between rounded-md border bg-background p-4 text-lg">
              <div className="break-all">{passphrase}</div>
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={copyToClipboard}
                      disabled={!passphrase}
                    >
                      {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      <span className="sr-only">Copy</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy to clipboard</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        )}
        
        {/* Passphrase Generation Form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Number of Words */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="words">Number of Words: {form.watch("words")}</Label>
            </div>
            <Slider
              id="words"
              min={3}
              max={12}
              step={1}
              value={[form.watch("words")]}
              onValueChange={(value) => form.setValue("words", value[0])}
              className="py-2"
            />
          </div>
          
          {/* Separator */}
          <div className="space-y-2">
            <Label htmlFor="separator">Word Separator</Label>
            <Input
              id="separator"
              maxLength={3}
              {...form.register("separator")}
            />
            {form.formState.errors.separator && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.separator.message}
              </p>
            )}
          </div>
          
          {/* Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="capitalize">Capitalize Words</Label>
              <Switch
                id="capitalize"
                checked={form.watch("capitalize")}
                onCheckedChange={(checked) => form.setValue("capitalize", checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="includeNumber">Include Number</Label>
              <Switch
                id="includeNumber"
                checked={form.watch("includeNumber")}
                onCheckedChange={(checked) => form.setValue("includeNumber", checked)}
              />
            </div>
          </div>
        </form>
      </CardContent>
      
      <CardFooter>
        <Button 
          type="submit" 
          className="w-full"
          onClick={form.handleSubmit(onSubmit)}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Passphrase"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}