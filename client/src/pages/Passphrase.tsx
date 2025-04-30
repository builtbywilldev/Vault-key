import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PassphraseGenerator from "@/components/PassphraseGenerator";

export default function Passphrase() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-6 md:py-12">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">Passphrase Generator</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create memorable and secure passphrases from random words
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <PassphraseGenerator />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}