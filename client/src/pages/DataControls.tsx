import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { AppNav } from "@/components/AppNav";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";
import { Database, Trash2, RefreshCw, Loader2, AlertTriangle } from "lucide-react";

export default function DataControls() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const exportData = trpc.consent.exportData.useMutation({
    onSuccess: (data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "kesher-my-data.json";
      a.click();
      toast.success("הנתונים יוצאו בהצלחה");
    },
  });
  const deleteAccount = trpc.consent.deleteAccount.useMutation({
    onSuccess: () => { toast.success("החשבון נמחק"); navigate("/"); },
    onError: (e) => toast.error(e.message),
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;
  if (!isAuthenticated) return <div className="min-h-screen flex items-center justify-center"><Button asChild><a href={getLoginUrl()}>Sign in</a></Button></div>;

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <AppNav />
      <main className="container py-8 max-w-xl mx-auto space-y-6">
        <div className="flex items-center gap-3 animate-fade-in-up">
          <Link href="/settings"><Button variant="ghost" size="sm">← חזרה</Button></Link>
          <h1 className="text-2xl font-serif font-semibold">הנתונים שלי</h1>
        </div>

        <div className="space-y-3 animate-fade-in-up">
          <div className="card-soft p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm">ייצוא נתונים</span>
            </div>
            <p className="text-xs text-muted-foreground">
              קבל/י קובץ JSON עם כל הנתונים שלך — פרופיל, הסכמות, הודעות, ונתוני AI.
              זכות זו מוקנית לך לפי חוק הגנת הפרטיות הישראלי.
            </p>
            <Button
              className="w-full gap-2"
              variant="outline"
              onClick={() => exportData.mutate()}
              disabled={exportData.isPending}
            >
              {exportData.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              ייצא את הנתונים שלי
            </Button>
          </div>

          <div className="card-soft p-5 space-y-3 border-destructive/20">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <span className="font-semibold text-sm text-destructive">מחיקת חשבון</span>
            </div>
            <p className="text-xs text-muted-foreground">
              מחיקת החשבון תמחק לצמיתות את כל הנתונים שלך — פרופיל, הודעות, התאמות, ונתוני AI.
              פעולה זו אינה הפיכה.
            </p>
            <Button
              className="w-full gap-2"
              variant="destructive"
              onClick={() => {
                if (confirm("האם אתה/את בטוח/ה שברצונך למחוק את החשבון? פעולה זו אינה הפיכה.")) {
                  deleteAccount.mutate();
                }
              }}
              disabled={deleteAccount.isPending}
            >
              {deleteAccount.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              מחק/י חשבון לצמיתות
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
