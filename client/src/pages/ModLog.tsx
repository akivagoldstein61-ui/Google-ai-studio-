import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { AppNav } from "@/components/AppNav";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Shield, Loader2 } from "lucide-react";

export default function ModLog() {
  const { user, isAuthenticated, loading } = useAuth();
  const logQuery = trpc.moderation.getLog.useQuery(undefined, {
    enabled: isAuthenticated && (user?.role === "moderator" || user?.role === "admin"),
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;
  if (!isAuthenticated) return <div className="min-h-screen flex items-center justify-center"><Button asChild><a href={getLoginUrl()}>Sign in</a></Button></div>;
  if (user?.role !== "moderator" && user?.role !== "admin") return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">גישה מוגבלת</p></div>;

  const entries = logQuery.data || [];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <AppNav />
      <main className="container py-8 max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3 animate-fade-in-up">
          <Link href="/mod/queue"><Button variant="ghost" size="sm">← חזרה לתור</Button></Link>
          <h1 className="text-2xl font-serif font-semibold">יומן מודרציה</h1>
        </div>

        {logQuery.isLoading && <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}

        {!logQuery.isLoading && entries.length === 0 && (
          <div className="card-soft p-8 text-center space-y-2">
            <Shield className="w-8 h-8 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">אין פעולות מודרציה עדיין</p>
          </div>
        )}

        <div className="space-y-2">
          {entries.map((entry: any) => (
            <div key={entry.id} className="card-soft p-4 flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium bg-muted px-2 py-0.5 rounded">{entry.action}</span>
                  <span className="text-xs text-muted-foreground">דיווח #{entry.reportId}</span>
                </div>
                {entry.notes && <p className="text-xs text-muted-foreground mt-1 truncate">{entry.notes}</p>}
              </div>
              <div className="text-xs text-muted-foreground flex-shrink-0">
                {new Date(entry.createdAt).toLocaleDateString("he-IL")}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
