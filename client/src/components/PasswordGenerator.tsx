import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

// Password generation form schema
const passwordFormSchema = z.object({
  length: z.number().min(8).max(128).default(16),
  useUppercase: z.boolean().default(true),
  useLowercase: z.boolean().default(true),
  useNumbers: z.boolean().default(true),
  useSymbols: z.boolean().default(true),
  excludeSimilarCharacters: z.boolean().default(false),
  excludeAmbiguous: z.boolean().default(false)
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export default function PasswordGenerator() {
  const [password, setPassword] = useState<string>("");
  const [isExpiring, setIsExpiring] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  // Initialize form with default values
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      length: 16,
      useUppercase: true,
      useLowercase: true,
      useNumbers: true,
      useSymbols: true,
      excludeSimilarCharacters: false,
      excludeAmbiguous: false
    },
  });

  // Password strength calculation
  const calculateStrength = (formValues: PasswordFormValues): number => {
    let strength = 0;
    
    // Base strength based on length (max 40%)
    strength += Math.min(40, (formValues.length / 20) * 40);
    
    // Character set variety (max 60%)
    let variety = 0;
    if (formValues.useLowercase) variety += 15;
    if (formValues.useUppercase) variety += 15;
    if (formValues.useNumbers) variety += 15;
    if (formValues.useSymbols) variety += 15;
    
    strength += variety;
    
    // Cap at 100%
    return Math.min(100, Math.ceil(strength));
  };
  
  const strength = calculateStrength(form.getValues());

  // Get strength color based on percentage
  const getStrengthColor = (strength: number): string => {
    if (strength < 30) return "bg-red-500";
    if (strength < 60) return "bg-yellow-500";
    if (strength < 80) return "bg-blue-500";
    return "bg-green-500";
  };
  
  // Get strength label
  const getStrengthLabel = (strength: number): string => {
    if (strength < 30) return "Weak";
    if (strength < 60) return "Fair";
    if (strength < 80) return "Good";
    return "Strong";
  };

  // Handle form submission
  const onSubmit = async (data: PasswordFormValues) => {
    try {
      setIsLoading(true);
      const result = await apiRequest(
        "POST",
        "/api/generate-password",
        data
      );
      
      const response = await result.json();
      setPassword(response.password);
      setIsExpiring(true);
      setTimeLeft(60);
      setIsCopied(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Copy password to clipboard
  const copyToClipboard = () => {
    if (!password) return;
    
    navigator.clipboard.writeText(password)
      .then(() => {
        setIsCopied(true);
        toast({
          title: "Copied!",
          description: "Password copied to clipboard",
        });
        
        // Reset the copied state after 2 seconds
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Failed to copy password to clipboard",
          variant: "destructive",
        });
      });
  };

  // Password expiration timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isExpiring && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setPassword("");
      setIsExpiring(false);
      
      toast({
        title: "Password Expired",
        description: "The password has been cleared for security.",
      });
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isExpiring, timeLeft, toast]);

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Password Generator</CardTitle>
        <CardDescription>
          Generate a secure, random password with your preferred settings
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Password Output */}
        {password && (
          <div className="relative">
            <div className="flex items-center justify-between rounded-md border bg-background p-4 font-mono text-lg">
              <div className="break-all">{password}</div>
              <div className="flex items-center gap-2">
                {isExpiring && (
                  <div className="text-sm text-muted-foreground">
                    Expires in {timeLeft}s
                  </div>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={copyToClipboard}
                      disabled={!password}
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
            
            {/* Password strength indicator */}
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Strength: {getStrengthLabel(strength)}</Label>
                <span className="text-sm text-muted-foreground">{strength}%</span>
              </div>
              <Progress value={strength} className={getStrengthColor(strength)} />
            </div>
          </div>
        )}
        
        {/* Password Generation Form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Password Length */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="length">Length: {form.watch("length")}</Label>
            </div>
            <Slider
              id="length"
              min={8}
              max={128}
              step={1}
              value={[form.watch("length")]}
              onValueChange={(value) => form.setValue("length", value[0])}
              className="py-2"
            />
          </div>
          
          {/* Character Sets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="useLowercase">Include Lowercase (a-z)</Label>
              <Switch
                id="useLowercase"
                checked={form.watch("useLowercase")}
                onCheckedChange={(checked) => form.setValue("useLowercase", checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="useUppercase">Include Uppercase (A-Z)</Label>
              <Switch
                id="useUppercase"
                checked={form.watch("useUppercase")}
                onCheckedChange={(checked) => form.setValue("useUppercase", checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="useNumbers">Include Numbers (0-9)</Label>
              <Switch
                id="useNumbers"
                checked={form.watch("useNumbers")}
                onCheckedChange={(checked) => form.setValue("useNumbers", checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="useSymbols">Include Symbols (!@#$%...)</Label>
              <Switch
                id="useSymbols"
                checked={form.watch("useSymbols")}
                onCheckedChange={(checked) => form.setValue("useSymbols", checked)}
              />
            </div>
          </div>
          
          {/* Advanced Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="excludeSimilarCharacters">Exclude Similar (i, l, 1, L, o, 0, O)</Label>
              <Switch
                id="excludeSimilarCharacters"
                checked={form.watch("excludeSimilarCharacters")}
                onCheckedChange={(checked) => form.setValue("excludeSimilarCharacters", checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="excludeAmbiguous">Exclude Ambiguous {'({[]()/\\\'"`~,;:.<>)'}</Label>
              <Switch
                id="excludeAmbiguous"
                checked={form.watch("excludeAmbiguous")}
                onCheckedChange={(checked) => form.setValue("excludeAmbiguous", checked)}
              />
            </div>
          </div>
          
          {/* Warning for not selecting any character set */}
          {(!form.watch("useLowercase") && 
            !form.watch("useUppercase") && 
            !form.watch("useNumbers") && 
            !form.watch("useSymbols")) && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>
                Please select at least one character set for your password.
              </AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
      
      <CardFooter>
        <Button 
          type="submit" 
          className="w-full"
          onClick={form.handleSubmit(onSubmit)}
          disabled={isLoading || (!form.watch("useLowercase") && 
                                 !form.watch("useUppercase") && 
                                 !form.watch("useNumbers") && 
                                 !form.watch("useSymbols"))}
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Password"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}