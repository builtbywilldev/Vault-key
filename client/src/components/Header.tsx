import { Link, useLocation } from "wouter";
import { MdLock } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Menu, LogIn, LogOut, User, KeyRound } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      setLocation("/");
    } else {
      toast({
        title: "Logout failed",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <MdLock className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">VaultKey</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
            Password Generator
          </Link>
          <Link href="/seeded" className="text-sm font-medium hover:text-primary transition-colors">
            Seeded Generator
          </Link>
          <Link href="/passphrase" className="text-sm font-medium hover:text-primary transition-colors">
            Passphrase
          </Link>
          <Link href="/morpheus" className="text-sm font-medium hover:text-primary transition-colors">
            Morpheus
          </Link>
          {isAuthenticated && (
            <Link href="/saved-passwords" className="text-sm font-medium hover:text-primary transition-colors">
              Saved Passwords
            </Link>
          )}
          <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
            About
          </Link>
        </nav>
        
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <div className="hidden md:block text-sm font-medium">
                <span>Hi, {user?.username}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="hidden md:flex items-center gap-2"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex items-center gap-2"
                onClick={() => setLocation("/login")}
              >
                <LogIn className="h-4 w-4" />
                Login
              </Button>
              <Button
                variant="default"
                size="sm"
                className="hidden md:flex items-center gap-2"
                onClick={() => setLocation("/register")}
              >
                <User className="h-4 w-4" />
                Register
              </Button>
            </>
          )}
          
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
                <Link href="/morpheus">Morpheus</Link>
              </DropdownMenuItem>
              {isAuthenticated && (
                <DropdownMenuItem asChild>
                  <Link href="/saved-passwords">Saved Passwords</Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link href="/about">About</Link>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              {isAuthenticated ? (
                <>
                  <DropdownMenuItem disabled>
                    <User className="mr-2 h-4 w-4" />
                    <span>Hi, {user?.username}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem onClick={() => setLocation("/login")}>
                    <LogIn className="mr-2 h-4 w-4" />
                    <span>Login</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation("/register")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Register</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}