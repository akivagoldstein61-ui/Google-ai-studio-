import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { AppNav } from "@/components/AppNav";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { MessageCircle, Loader2 } from "lucide-react";

export default function Inbox() {
  const { isAuthenticated, loading } = useAuth();
  const matchesQuery = trpc.matches.list.useQuery(undefined, { enabled: isAuthenticated });

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;
  if (!isAuthenticated) return <div className="min-h-screen flex items-center justify-center"><Button asChild><a href={getLoginUrl()}>Sign in</a></Button></div>;

  const matches = matchesQuery.data || [];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <AppNav />
      <main className="container py-8 max-w-lg mx-auto space-y-6">
        <div className="animate-fade-in-up">
          <h1 className="text-2xl font-serif font-semibold">תיבת דואר</h1>
          <p className="text-muted-foreground text-sm mt-1">שיחות עם ההתאמות שלך</p>
        </div>

        {matchesQuery.isLoading && (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        )}

        {!matchesQuery.isLoading && matches.length === 0 && (
          <div className="card-soft p-10 text-center space-y-3">
            <MessageCircle className="w-10 h-10 text-muted-foreground mx-auto" />
            <p className="font-medium">אין שיחות עדיין</p>
            <p className="text-sm text-muted-foreground">כאשר יהיו לך התאמות הדדיות, השיחות יופיעו כאן.</p>
          </div>
        )}

        <div className="space-y-2">
          {matches.map((match) => {
            const profile = match.otherProfile;
            const media = profile?.media || [];
            return (
              <Link key={match.id} href={`/chat/${match.id}`}>
                <div className="card-soft p-4 flex items-center gap-4 cursor-pointer hover:border-primary/40 transition-all">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {media[0] ? (
                      <img src={media[0].url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-serif text-primary">{profile?.displayName?.[0] || "?"}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{profile?.displayName || "שותף/ה"}</p>
                    <p className="text-xs text-muted-foreground">{profile?.location || ""}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(match.createdAt).toLocaleDateString("he-IL")}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
