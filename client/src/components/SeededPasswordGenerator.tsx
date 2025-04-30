import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check, RefreshCw, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

// Seeded password generation form schema
const seededPasswordFormSchema = z.object({
  masterWord: z.string().min(1, "Master word is required"),
  domain: z.string().min(1, "Domain is required"),
  length: z.number().min(8).max(128).default(16),
  useUppercase: z.boolean().default(true),
  useLowercase: z.boolean().default(true),
  useNumbers: z.boolean().default(true),
  useSymbols: z.boolean().default(true)
});

type SeededPasswordFormValues = z.infer<typeof seededPasswordFormSchema>;

export default function SeededPasswordGenerator() {
  const [password, setPassword] = useState<string>("");
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  // Initialize form with default values
  const form = useForm<SeededPasswordFormValues>({
    resolver: zodResolver(seededPasswordFormSchema),
    defaultValues: {
      masterWord: "",
      domain: "",
      length: 16,
      useUppercase: true,
      useLowercase: true,
      useNumbers: true,
      useSymbols: true
    },
  });

  // Password strength calculation
  const calculateStrength = (formValues: SeededPasswordFormValues): number => {
    let strength = 0;
    
    // Base strength based on length (max 40%)
    strength += Math.min(40, (formValues.length / 20) * 40);
    
    // Character set variety (max 40%)
    let variety = 0;
    if (formValues.useLowercase) variety += 10;
    if (formValues.useUppercase) variety += 10;
    if (formValues.useNumbers) variety += 10;
    if (formValues.useSymbols) variety += 10;
    
    strength += variety;
    
    // Master word and domain strength (max 20%)
    const masterWordStrength = Math.min(10, (formValues.masterWord.length / 10) * 10);
    const domainStrength = Math.min(10, (formValues.domain.length / 10) * 10);
    
    strength += masterWordStrength + domainStrength;
    
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
  const onSubmit = async (data: SeededPasswordFormValues) => {
    try {
      setIsLoading(true);
      const result = await apiRequest(
        "POST",
        "/api/generate-seeded-password",
        data
      );
      
      const response = await result.json();
      setPassword(response.password);
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

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Seeded Password Generator</CardTitle>
        <CardDescription>
          Generate a deterministic password using your master word and domain
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Seeded passwords are deterministic - the same master word and domain will always generate the same password.
          </AlertDescription>
        </Alert>
        
        {/* Password Output */}
        {password && (
          <div className="relative">
            <div className="flex items-center justify-between rounded-md border bg-background p-4 font-mono text-lg">
              <div className="break-all">{password}</div>
              <div className="flex items-center gap-2">
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
        
        {/* Seeded Password Generation Form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Master Word */}
          <div className="space-y-2">
            <Label htmlFor="masterWord">Master Word</Label>
            <Input
              id="masterWord"
              type="password"
              placeholder="Enter your master word"
              {...form.register("masterWord")}
            />
            {form.formState.errors.masterWord && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.masterWord.message}
              </p>
            )}
          </div>
          
          {/* Domain */}
          <div className="space-y-2">
            <Label htmlFor="domain">Domain</Label>
            <Input
              id="domain"
              placeholder="example.com"
              {...form.register("domain")}
            />
            {form.formState.errors.domain && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.domain.message}
              </p>
            )}
          </div>
          
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