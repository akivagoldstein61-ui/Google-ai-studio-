import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { AppNav } from "@/components/AppNav";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { Scale, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";

export default function AppealFlow() {
  const { isAuthenticated, loading } = useAuth();
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Submit appeal via the dedicated consent.submitAppeal mutation
  const submitAppeal = trpc.consent.submitAppeal.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("הערעור הוגש בהצלחה");
    },
    onError: (e) => toast.error(e.message),
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;
  if (!isAuthenticated) return <div className="min-h-screen flex items-center justify-center"><Button asChild><a href={getLoginUrl()}>Sign in</a></Button></div>;

  if (submitted) {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        <AppNav />
        <main className="container py-16 max-w-md mx-auto text-center space-y-6">
          <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto" />
          <h1 className="text-2xl font-serif font-semibold">הערעור הוגש</h1>
          <p className="text-muted-foreground text-sm">
            הצוות שלנו יבחן את הערעור תוך 3-5 ימי עסקים ויעדכן אותך בדוא"ל.
          </p>
          <Button asChild variant="outline">
            <a href="/home">חזרה לדף הבית</a>
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <AppNav />
      <main className="container py-8 max-w-lg mx-auto space-y-6">
        <div className="animate-fade-in-up">
          <div className="flex items-center gap-2 mb-2">
            <Scale className="w-5 h-5 text-primary" />
            <span className="trust-badge">ערעור</span>
          </div>
          <h1 className="text-2xl font-serif font-semibold">הגשת ערעור</h1>
          <p className="text-muted-foreground text-sm mt-1">
            אם קיבלת החלטת מודרציה שאינך מסכים/ה איתה, ניתן להגיש ערעור.
          </p>
        </div>

        <div className="card-soft p-5 space-y-4 animate-fade-in-up">
          <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              ערעורים נבחנים על ידי צוות מודרציה אנושי. AI לא מקבל החלטות בערעורים.
              הצוות יעדכן אותך תוך 3-5 ימי עסקים.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">פרטי הערעור</label>
            <textarea
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              rows={6}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="תאר/י את הנסיבות ומדוע לדעתך ההחלטה אינה מוצדקת..."
              maxLength={3000}
            />
            <p className="text-xs text-muted-foreground text-left">{reason.length}/3000</p>
          </div>

          <Button
            className="w-full gap-2 bg-primary text-primary-foreground"
            onClick={() => {
              if (reason.trim().length < 20) {
                toast.error("אנא הוסף/י פרטים נוספים (לפחות 20 תווים)");
                return;
              }
              submitAppeal.mutate({ reason });
            }}
            disabled={submitAppeal.isPending || reason.trim().length < 20}
          >
            {submitAppeal.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scale className="w-4 h-4" />}
            הגש/י ערעור
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            הגשת ערעור שקרי עלולה לגרום לנקיטת פעולה נוספת.
          </p>
        </div>
      </main>
    </div>
  );
}
