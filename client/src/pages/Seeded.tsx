import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SeededPasswordGenerator from "@/components/SeededPasswordGenerator";

export default function Seeded() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-6 md:py-12">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">Seeded Password Generator</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create deterministic passwords using a master word and domain name combination
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <SeededPasswordGenerator />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}