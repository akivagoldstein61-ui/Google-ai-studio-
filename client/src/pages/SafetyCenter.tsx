import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { AppNav } from "@/components/AppNav";
import { trpc } from "@/lib/trpc";
import { useSearch } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { Shield, AlertTriangle, Loader2, CheckCircle2, Sparkles } from "lucide-react";
import { Streamdown } from "streamdown";

const REPORT_REASONS = [
  "הונאה / פרופיל מזויף",
  "הטרדה מינית",
  "תוכן לא הולם",
  "אלימות / איומים",
  "ספאם",
  "אחר",
];

export default function SafetyCenter() {
  const { isAuthenticated, loading } = useAuth();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const reportTarget = params.get("report");

  const submitReport = trpc.safety.submitReport.useMutation({
    onSuccess: () => { toast.success("הדיווח נשלח. תודה על שמירת הקהילה."); setReportSent(true); },
    onError: (e) => toast.error(e.message),
  });
  const safetyAdvice = trpc.ai.safetyAdvice.useMutation();

  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSent, setReportSent] = useState(false);
  const [adviceQuery, setAdviceQuery] = useState("");
  const [adviceResult, setAdviceResult] = useState<{ advice: string; resources: string[] } | null>(null);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;
  if (!isAuthenticated) return <div className="min-h-screen flex items-center justify-center"><Button asChild><a href={getLoginUrl()}>Sign in</a></Button></div>;

  const handleReport = () => {
    if (!reportReason) { toast.error("אנא בחר/י סיבה לדיווח"); return; }
    submitReport.mutate({
      reportedUserId: reportTarget ? parseInt(reportTarget.replace("match-", "")) : 0,
      reason: reportReason,
      details: reportDetails,
    });
  };

  const handleAdvice = async () => {
    if (!adviceQuery.trim()) return;
    const result = await safetyAdvice.mutateAsync({ situation: adviceQuery });
    setAdviceResult(result);
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <AppNav />
      <main className="container py-8 max-w-xl mx-auto space-y-8">
        <div className="animate-fade-in-up">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="trust-badge">מרכז בטיחות</span>
          </div>
          <h1 className="text-2xl font-serif font-semibold">מרכז הבטיחות</h1>
          <p className="text-muted-foreground text-sm mt-1">
            דיווח, חסימה, ועצות בטיחות — תמיד זמינים.
          </p>
        </div>

        {/* Emergency resources */}
        <div className="card-soft p-4 bg-destructive/5 border-destructive/20 space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <span className="text-sm font-semibold text-destructive">מצב חירום?</span>
          </div>
          <ul className="text-sm space-y-1">
            <li>• <strong>משטרה:</strong> 100</li>
            <li>• <strong>עזרה ראשונה:</strong> 101</li>
            <li>• <strong>קו סיוע לנפגעות תקיפה מינית:</strong> 1202</li>
            <li>• <strong>ער"ן (קו חירום נפשי):</strong> 1201</li>
          </ul>
        </div>

        {/* AI Safety Advice */}
        <div className="card-soft p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">עצות בטיחות AI</span>
          </div>
          <p className="text-xs text-muted-foreground">תאר/י מצב ותקבל/י עצות כלליות. AI לא מחליף ייעוץ מקצועי.</p>
          <textarea
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            rows={3}
            value={adviceQuery}
            onChange={(e) => setAdviceQuery(e.target.value)}
            placeholder="לדוגמה: מישהו מבקש ממני כסף, מה לעשות?"
            maxLength={500}
          />
          <Button
            className="w-full bg-primary text-primary-foreground gap-2"
            onClick={handleAdvice}
            disabled={safetyAdvice.isPending || !adviceQuery.trim()}
          >
            {safetyAdvice.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
            קבל/י עצות בטיחות
          </Button>
          {adviceResult && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-2 animate-fade-in-up">
              <Streamdown>{adviceResult.advice}</Streamdown>
              {adviceResult.resources.length > 0 && (
                <div>
                  <p className="text-xs font-medium">משאבים:</p>
                  <ul className="text-xs text-muted-foreground space-y-0.5">
                    {adviceResult.resources.map((r, i) => <li key={i}>• {r}</li>)}
                  </ul>
                </div>
              )}
              <p className="text-xs text-muted-foreground italic">אלו עצות כלליות בלבד. במצב חירום — פנה/י לרשויות.</p>
            </div>
          )}
        </div>

        {/* Report form */}
        {!reportSent ? (
          <div className="card-soft p-5 space-y-4">
            <h2 className="font-semibold">דיווח על משתמש/ת</h2>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">סיבת הדיווח:</p>
              <div className="flex flex-wrap gap-2">
                {REPORT_REASONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setReportReason(r)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${reportReason === r ? "bg-destructive text-destructive-foreground border-destructive" : "border-border hover:border-destructive/50"}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              rows={3}
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              placeholder="פרטים נוספים (אופציונלי)..."
              maxLength={1000}
            />
            <Button
              className="w-full gap-2"
              variant="destructive"
              onClick={handleReport}
              disabled={submitReport.isPending || !reportReason}
            >
              {submitReport.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
              שלח/י דיווח
            </Button>
          </div>
        ) : (
          <div className="card-soft p-6 text-center space-y-3 animate-fade-in-up">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <p className="font-semibold">הדיווח נשלח בהצלחה</p>
            <p className="text-sm text-muted-foreground">צוות המודרציה שלנו יבדוק את הדיווח בהקדם. תודה על שמירת הקהילה.</p>
          </div>
        )}
      </main>
    </div>
  );
}
