import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
      <div className="text-center space-y-4 animate-fade-in-up">
        <p className="text-8xl font-serif font-bold text-primary/20">404</p>
        <h1 className="text-2xl font-serif font-semibold">הדף לא נמצא</h1>
        <p className="text-muted-foreground">הדף שחיפשת אינו קיים.</p>
        <Button asChild className="bg-primary text-primary-foreground">
          <Link href="/">חזרה לדף הבית</Link>
        </Button>
      </div>
    </div>
  );
}
