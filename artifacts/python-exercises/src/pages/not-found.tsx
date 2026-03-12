import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Bug } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-bounce">
          <Bug className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-6xl font-display font-bold text-foreground mb-4">404</h1>
        <h2 className="text-2xl font-bold text-slate-700 mb-4">Page not found</h2>
        <p className="text-muted-foreground mb-8">
          Oops! Looks like we encountered a syntax error in our routing. This page doesn't exist.
        </p>
        <Link href="/">
          <Button size="lg">Return to Base</Button>
        </Link>
      </div>
    </div>
  );
}
