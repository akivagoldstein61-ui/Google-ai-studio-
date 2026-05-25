import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { AppNav } from "@/components/AppNav";
import { trpc } from "@/lib/trpc";
import { useParams, Link } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { Shield, Sparkles, Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { Streamdown } from "streamdown";

const ACTIONS = [
  { value: "dismiss", label: "סגור — לא מוצדק", cls: "border-muted text-muted-foreground" },
  { value: "warn", label: "אזהרה למשתמש", cls: "border-amber-300 text-amber-700" },
  { value: "suspend_7d", label: "השעיה 7 ימים", cls: "border-orange-300 text-orange-700" },
  { value: "suspend_30d", label: "השעיה 30 ימים", cls: "border-red-300 text-red-700" },
  { value: "ban", label: "חסימה קבועה", cls: "border-destructive text-destructive" },
];

export default function ModCaseDetail() {
  const { id } = useParams<{ id: string }>();
  const caseId = parseInt(id || "0");
  const { user, isAuthenticated, loading } = useAuth();

  const caseQuery = trpc.moderation.getCase.useQuery({ id: caseId }, { enabled: isAuthenticated && caseId > 0 });
  const aiSummary = trpc.ai.moderationSummary.useMutation();
  const resolveCase = trpc.moderation.resolveCase.useMutation({
    onSuccess: () => { toast.success("המקרה טופל"); caseQuery.refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const [selectedAction, setSelectedAction] = useState("");
  const [notes, setNotes] = useState("");
  const [aiDraft, setAiDraft] = useState<{ summary: string; suggestedAction: string; confidence: string; caveat: string } | null>(null);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;
  if (!isAuthenticated) return <div className="min-h-screen flex items-center justify-center"><Button asChild><a href={getLoginUrl()}>Sign in</a></Button></div>;
  if (user?.role !== "moderator" && user?.role !== "admin") return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">גישה מוגבלת</p></div>;

  const report = caseQuery.data;

  const handleAISummary = async () => {
    const result = await aiSummary.mutateAsync({ reportId: caseId });
    setAiDraft(result);
  };

  const handleResolve = () => {
    if (!selectedAction) { toast.error("אנא בחר/י פעולה"); return; }
    resolveCase.mutate({ reportId: caseId, action: selectedAction, notes });
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <AppNav />
      <main className="container py-8 max-w-xl mx-auto space-y-6">
        <div className="flex items-center gap-3 animate-fade-in-up">
          <Link href="/mod/queue"><Button variant="ghost" size="sm">← חזרה לתור</Button></Link>
          <h1 className="text-2xl font-serif font-semibold">מקרה #{caseId}</h1>
        </div>

        {caseQuery.isLoading && <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}

        {report && (
          <div className="space-y-5 animate-fade-in-up">
            {/* Report details */}
            <div className="card-soft p-5 space-y-3">
              <h2 className="font-semibold">פרטי הדיווח</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">סיבה:</span> <span className="font-medium">{report.reason}</span></div>
                <div><span className="text-muted-foreground">סטטוס:</span> <span className="font-medium">{report.status}</span></div>
                <div><span className="text-muted-foreground">תאריך:</span> <span>{new Date(report.createdAt).toLocaleDateString("he-IL")}</span></div>
              </div>
              {report.details && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">פרטים:</p>
                  <p className="text-sm">{report.details}</p>
                </div>
              )}
            </div>

            {/* AI Summary — DRAFT ONLY */}
            <div className="card-soft p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-sm">סיכום AI (טיוטה — דורש החלטה אנושית)</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs"
                  onClick={handleAISummary}
                  disabled={aiSummary.isPending}
                >
                  {aiSummary.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  צור סיכום AI
                </Button>
              </div>
              {aiDraft ? (
                <div className="space-y-2">
                  <Streamdown>{aiDraft.summary}</Streamdown>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">הצעת AI:</span>
                    <span className="font-medium">{aiDraft.suggestedAction}</span>
                    <span className="text-muted-foreground">({aiDraft.confidence})</span>
                  </div>
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {aiDraft.caveat}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">לחץ/י על "צור סיכום AI" לקבלת טיוטה. ההחלטה הסופית שלך.</p>
              )}
            </div>

            {/* Human decision */}
            {report.status === "pending" && (
              <div className="card-soft p-5 space-y-4">
                <h2 className="font-semibold">החלטת מנחה</h2>
                <div className="grid grid-cols-1 gap-2">
                  {ACTIONS.map((action) => (
                    <button
                      key={action.value}
                      onClick={() => setSelectedAction(action.value)}
                      className={`px-4 py-2.5 rounded-lg text-sm border text-right transition-colors ${selectedAction === action.value ? `${action.cls} bg-current/10` : "border-border hover:border-primary/30"} ${selectedAction === action.value ? "" : "text-foreground"}`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
                <textarea
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="הערות מנחה (אופציונלי)..."
                  maxLength={2000}
                />
                <Button
                  className="w-full gap-2 bg-primary text-primary-foreground"
                  onClick={handleResolve}
                  disabled={resolveCase.isPending || !selectedAction}
                >
                  {resolveCase.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  אשר/י החלטה
                </Button>
              </div>
            )}

            {report.status !== "pending" && (
              <div className="card-soft p-4 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="font-medium">מקרה זה טופל</p>
                <p className="text-sm text-muted-foreground">פעולה: {report.resolution}</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
