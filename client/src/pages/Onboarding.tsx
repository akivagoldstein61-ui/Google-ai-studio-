import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { AppNav } from "@/components/AppNav";
import { Link, useLocation } from "wouter";
import { CheckCircle2, ArrowLeft } from "lucide-react";

const STEPS = [
  { id: 1, title: "יצירת פרופיל", desc: "הצג/י את עצמך בצורה אותנטית", href: "/profile/build" },
  { id: 2, title: "ערכים והעדפות", desc: "מה חשוב לך בקשר?", href: "/profile/build?step=values" },
  { id: 3, title: "העדפות חיפוש", desc: "מי מתאים לך?", href: "/profile/build?step=prefs" },
  { id: 4, title: "מרכז כישורים", desc: "גלה/י את כלי ה-AI שלנו", href: "/skills" },
];

export default function Onboarding() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;
  if (!isAuthenticated) return <div className="min-h-screen flex items-center justify-center"><Button asChild><a href={getLoginUrl()}>Sign in</a></Button></div>;

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <AppNav />
      <main className="container py-12 max-w-xl mx-auto space-y-8">
        <div className="text-center space-y-2 animate-fade-in-up">
          <h1 className="text-3xl font-serif font-semibold">ברוך/ה הבא/ה לקשר</h1>
          <p className="text-muted-foreground">בואו נתחיל את המסע שלך בכמה צעדים פשוטים</p>
        </div>
        <div className="space-y-3">
          {STEPS.map((step) => (
            <Link key={step.id} href={step.href}>
              <div className="card-soft p-5 flex items-center gap-4 cursor-pointer hover:border-primary/40 transition-all group">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm group-hover:bg-primary/20 transition-colors">
                  {step.id}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{step.title}</p>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
                <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center">
          <Button asChild size="lg" className="bg-primary text-primary-foreground">
            <Link href="/profile/build">
              <ArrowLeft className="w-5 h-5 ml-2" />
              התחל/י עם הפרופיל
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
