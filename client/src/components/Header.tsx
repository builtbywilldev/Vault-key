import { Link } from "wouter";
import { MdLock } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <MdLock className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">VaultKey</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/">
            <a className="text-sm font-medium hover:text-primary transition-colors">Password Generator</a>
          </Link>
          <Link href="/seeded">
            <a className="text-sm font-medium hover:text-primary transition-colors">Seeded Generator</a>
          </Link>
          <Link href="/passphrase">
            <a className="text-sm font-medium hover:text-primary transition-colors">Passphrase</a>
          </Link>
          <Link href="/about">
            <a className="text-sm font-medium hover:text-primary transition-colors">About</a>
          </Link>
        </nav>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="md:hidden">
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href="/">Password Generator</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/seeded">Seeded Generator</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/passphrase">Passphrase</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/about">About</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}