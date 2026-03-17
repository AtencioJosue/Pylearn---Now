import { Link, useLocation } from "wouter";
import { BookOpen, Trophy, ArrowLeft, Code2 } from "lucide-react";
import { useGetProgress } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

export function Navbar({ backTo = null }: { backTo?: string | null }) {
  const { data: progress } = useGetProgress();
  const [location] = useLocation();

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-background/80 border-b border-border/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          <div className="flex items-center gap-4">
            {backTo && (
              <Link href={backTo} className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            )}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="font-display font-bold text-2xl tracking-tight text-foreground">
                PyLearn
              </span>
            </Link>

            {/* Navigation links */}
            <div className="hidden sm:flex items-center gap-1 ml-4">
              <Link
                href="/"
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-bold transition-colors",
                  location === "/"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                Ejercicios
              </Link>
              <Link
                href="/playground"
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-colors",
                  location === "/playground"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Code2 className="w-4 h-4" />
                Editor libre
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile playground link */}
            <Link
              href="/playground"
              className="sm:hidden p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              title="Editor libre"
            >
              <Code2 className="w-5 h-5" />
            </Link>

            {progress && (
              <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl shadow-sm border border-border/50">
                <Trophy className="w-5 h-5 text-secondary" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider leading-none">Puntaje</span>
                  <span className="font-display font-bold text-lg leading-none text-foreground">{progress.correctAnswers}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
