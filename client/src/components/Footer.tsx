import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Morpheus AI. All rights reserved.
        </p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="text-muted-foreground">
            Futuristic AI Interface
          </span>
        </div>
      </div>
    </footer>
  );
}