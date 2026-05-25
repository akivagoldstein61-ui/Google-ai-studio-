import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { AppNav } from "@/components/AppNav";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Shield, AlertTriangle, Loader2, Clock } from "lucide-react";

export default function ModQueue() {
  const { user, isAuthenticated, loading } = useAuth();
  const queueQuery = trpc.moderation.getQueue.useQuery(undefined, {
    enabled: isAuthenticated && (user?.role === "moderator" || user?.role === "admin"),
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;
  if (!isAuthenticated) return <div className="min-h-screen flex items-center justify-center"><Button asChild><a href={getLoginUrl()}>Sign in</a></Button></div>;
  if (user?.role !== "moderator" && user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <Shield className="w-10 h-10 text-muted-foreground mx-auto" />
          <p className="font-medium">גישה מוגבלת</p>
          <p className="text-sm text-muted-foreground">דף זה מיועד למנחים בלבד.</p>
        </div>
      </div>
    );
  }

  const reports = queueQuery.data || [];
  const pending = reports.filter((r) => r.status === "pending");

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <AppNav />
      <main className="container py-8 max-w-2xl mx-auto space-y-6">
        <div className="animate-fade-in-up">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="trust-badge">מנחה</span>
          </div>
          <h1 className="text-2xl font-serif font-semibold">תור מודרציה</h1>
          <p className="text-muted-foreground text-sm mt-1">{pending.length} דיווחים ממתינים לבדיקה</p>
        </div>

        {queueQuery.isLoading && <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}

        {!queueQuery.isLoading && pending.length === 0 && (
          <div className="card-soft p-10 text-center space-y-3">
            <Shield className="w-10 h-10 text-emerald-600 mx-auto" />
            <p className="font-medium">אין דיווחים ממתינים</p>
            <p className="text-sm text-muted-foreground">כל הדיווחים טופלו. עבודה טובה!</p>
          </div>
        )}

        <div className="space-y-3">
          {pending.map((report) => (
            <Link key={report.id} href={`/mod/case/${report.id}`}>
              <div className="card-soft p-4 flex items-center gap-4 cursor-pointer hover:border-primary/40 transition-all">
                <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">דיווח #{report.id}</p>
                  <p className="text-xs text-muted-foreground truncate">{report.reason}</p>
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(report.createdAt).toLocaleDateString("he-IL")}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="flex gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href="/mod/log">יומן מודרציה</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
