import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ShieldCheck, Lock, Globe, Key } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-6 md:py-12">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">About VaultKey</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Secure password generation with a focus on privacy and security
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Features */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold">Complete Privacy</h2>
              </div>
              <p className="text-muted-foreground">
                VaultKey generates all passwords entirely client-side with zero storage. Your data never leaves your browser, ensuring complete privacy and security.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Lock className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold">Secure by Design</h2>
              </div>
              <p className="text-muted-foreground">
                Our password algorithms follow NIST guidelines for password security, using cryptographically secure random number generation.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Key className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold">Seeded Passwords</h2>
              </div>
              <p className="text-muted-foreground">
                Generate deterministic passwords using a master word and domain, allowing you to recreate the same password whenever needed without storing it.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Globe className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold">API Access</h2>
              </div>
              <p className="text-muted-foreground">
                Developers can access our password generation capabilities via a simple REST API, making integration into existing applications seamless.
              </p>
            </div>
          </section>
          
          {/* How it Works */}
          <section className="space-y-6">
            <h2 className="text-3xl font-semibold text-center">How It Works</h2>
            <div className="prose prose-lg max-w-none">
              <p>
                VaultKey uses JavaScript's secure random number generation to create truly random passwords based on your specified criteria. All processing happens directly in your browser - we never send your data to any server.
              </p>
              <p>
                For seeded passwords, we use a cryptographic hash function (SHA-256) to deterministically generate a password based on your master word and the domain name. This means you can always recreate the same password for a specific website without having to store it, as long as you remember your master word.
              </p>
              <p>
                Our passphrase generator creates memorable phrases by randomly selecting words from a curated dictionary of common words, which are easier to remember while still providing strong security.
              </p>
            </div>
          </section>
          
          {/* Security */}
          <section className="space-y-6">
            <h2 className="text-3xl font-semibold text-center">Security First</h2>
            <div className="prose prose-lg max-w-none">
              <p>
                Your security is our top priority. VaultKey was built following these principles:
              </p>
              <ul>
                <li><strong>Zero storage:</strong> We never store your passwords or master words.</li>
                <li><strong>Client-side generation:</strong> All password generation happens in your browser.</li>
                <li><strong>No analytics:</strong> We don't track your usage or collect any data.</li>
                <li><strong>Open source:</strong> Our code is open for review by security experts.</li>
              </ul>
            </div>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}