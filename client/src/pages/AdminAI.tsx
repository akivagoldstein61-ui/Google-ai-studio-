import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { AppNav } from "@/components/AppNav";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Sparkles, Shield, Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

const AI_GOVERNANCE_RULES = [
  { rule: "AI לא שולח הודעות אוטומטית", status: "enforced" },
  { rule: "AI לא חושף תשובות פרטיות", status: "enforced" },
  { rule: "AI לא מאבחן אישיות", status: "enforced" },
  { rule: "AI לא מקבל החלטות מודרציה", status: "enforced" },
  { rule: "כל הסבר AI מציין מקור", status: "enforced" },
  { rule: "בדיקת תמונה AI — חסום", status: "blocked" },
  { rule: "ניתוח מאפיינים מוגנים — חסום", status: "blocked" },
  { rule: "שמירת נתוני AI מעבר ל-30 יום — מוגבל", status: "limited" },
];

export default function AdminAI() {
  const { user, isAuthenticated, loading } = useAuth();
  const aiUsageQuery = trpc.admin.getAIUsage.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin" });

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;
  if (!isAuthenticated) return <div className="min-h-screen flex items-center justify-center"><Button asChild><a href={getLoginUrl()}>Sign in</a></Button></div>;
  if (user?.role !== "admin") return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">גישה מוגבלת</p></div>;

  const usage = aiUsageQuery.data || [];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <AppNav />
      <main className="container py-8 max-w-2xl mx-auto space-y-8">
        <div className="flex items-center gap-3 animate-fade-in-up">
          <Link href="/admin"><Button variant="ghost" size="sm">← חזרה</Button></Link>
          <h1 className="text-2xl font-serif font-semibold">ממשל AI</h1>
        </div>

        {/* Governance rules */}
        <div className="space-y-3">
          <h2 className="font-semibold">כללי ממשל AI</h2>
          {AI_GOVERNANCE_RULES.map(({ rule, status }) => (
            <div key={rule} className="card-soft p-3 flex items-center gap-3">
              {status === "enforced" && <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
              {status === "blocked" && <XCircle className="w-4 h-4 text-destructive flex-shrink-0" />}
              {status === "limited" && <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />}
              <span className="text-sm">{rule}</span>
              <span className={`mr-auto text-xs px-2 py-0.5 rounded-full border ${status === "enforced" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : status === "blocked" ? "bg-red-50 text-red-700 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                {status === "enforced" ? "אכוף" : status === "blocked" ? "חסום" : "מוגבל"}
              </span>
            </div>
          ))}
        </div>

        {/* AI Usage stats */}
        <div className="space-y-3">
          <h2 className="font-semibold">שימוש בכלי AI (30 ימים אחרונים)</h2>
          {aiUsageQuery.isLoading && <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>}
          {usage.length === 0 && !aiUsageQuery.isLoading && (
            <div className="card-soft p-6 text-center">
              <p className="text-muted-foreground text-sm">אין נתוני שימוש עדיין</p>
            </div>
          )}
          {usage.map((item: any) => (
            <div key={item.feature} className="card-soft p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{item.feature}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">{item.count.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">שימושים</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
