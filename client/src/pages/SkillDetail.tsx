import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { AppNav } from "@/components/AppNav";
import { trpc } from "@/lib/trpc";
import { useParams, Link } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, Shield, Loader2, ArrowLeft, Lock } from "lucide-react";
import { Streamdown } from "streamdown";

export default function SkillDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated, loading } = useAuth();

  const personalitySummary = trpc.ai.personalitySummary.useMutation();
  const [summaryResult, setSummaryResult] = useState<{ summary: string; caveat: string } | null>(null);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;
  if (!isAuthenticated) return <div className="min-h-screen flex items-center justify-center"><Button asChild><a href={getLoginUrl()}>Sign in</a></Button></div>;

  const handlePersonalitySummary = async () => {
    const result = await personalitySummary.mutateAsync({});
    setSummaryResult(result);
  };

  if (slug === "personality-summary") {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        <AppNav />
        <main className="container py-8 max-w-xl mx-auto space-y-6 animate-fade-in-up">
          <Link href="/skills">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              חזרה למרכז הכישורים
            </Button>
          </Link>
          <div className="space-y-2">
            <h1 className="text-2xl font-serif font-semibold">סיכום ערכים</h1>
            <p className="text-muted-foreground text-sm">
              קבל/י סיכום חם ולא-אבחוני של הערכים הציבוריים שלך — כפי שהם משתקפים בפרופיל.
            </p>
          </div>

          <div className="card-soft p-4 bg-primary/5 border-primary/20 space-y-2">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">הגנת פרטיות</span>
            </div>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• מבוסס רק על תשובות ציבוריות שמסרת</li>
              <li>• לא אבחון פסיכולוגי</li>
              <li>• לא משותף אוטומטית עם אחרים</li>
              <li>• ניתן למחוק בכל עת מהגדרות הפרטיות</li>
            </ul>
          </div>

          {!summaryResult ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                לחץ/י על הכפתור כדי לקבל סיכום AI של הערכים שלך. הסיכום הוא טיוטה בלבד.
              </p>
              <Button
                className="w-full bg-primary text-primary-foreground gap-2"
                onClick={handlePersonalitySummary}
                disabled={personalitySummary.isPending}
              >
                {personalitySummary.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                צור סיכום ערכים
              </Button>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in-up">
              <div className="card-soft p-5 space-y-3">
                <div className="flex items-center gap-2 text-primary">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-semibold">סיכום ערכים (טיוטת AI)</span>
                </div>
                <Streamdown>{summaryResult.summary}</Streamdown>
                <p className="text-xs text-muted-foreground border-t border-border/50 pt-3 italic">
                  {summaryResult.caveat}
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => setSummaryResult(null)}
              >
                צור מחדש
              </Button>
            </div>
          )}
        </main>
      </div>
    );
  }

  // Generic skill detail fallback
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <AppNav />
      <main className="container py-8 max-w-xl mx-auto space-y-6 animate-fade-in-up">
        <Link href="/skills">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            חזרה למרכז הכישורים
          </Button>
        </Link>
        <div className="card-soft p-8 text-center space-y-3">
          <Sparkles className="w-10 h-10 text-muted-foreground mx-auto" />
          <p className="font-medium">כישור: {slug}</p>
          <p className="text-sm text-muted-foreground">
            כישור זה נגיש ישירות מהדפים הרלוונטיים (פרופיל, שיחות, בחירות יומיות).
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/skills">חזרה למרכז הכישורים</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
