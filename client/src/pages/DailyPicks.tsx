import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { AppNav } from "@/components/AppNav";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { Heart, X, Sparkles, Shield, Loader2, MapPin, Calendar } from "lucide-react";
import { Link } from "wouter";

export default function DailyPicks() {
  const { isAuthenticated, loading } = useAuth();
  const picksQuery = trpc.matches.getDailyPicks.useQuery(undefined, { enabled: isAuthenticated });
  const likeMutation = trpc.matches.like.useMutation({
    onSuccess: (data) => {
      if (data.matched) toast.success("🎉 זה קשר! יש לכם התאמה הדדית");
      picksQuery.refetch();
    },
    onError: (e) => toast.error(e.message),
  });
  const passMutation = trpc.matches.pass.useMutation({
    onSuccess: () => picksQuery.refetch(),
  });

  const [whyMatchTarget, setWhyMatchTarget] = useState<number | null>(null);
  const [whyMatchResult, setWhyMatchResult] = useState<Record<number, { explanation: string; sharedSignals: string[]; caveat: string }>>({});
  const whyMatch = trpc.ai.whyMatch.useMutation({
    onSuccess: (data, vars) => {
      setWhyMatchResult((prev) => ({ ...prev, [vars.matchId]: data }));
    },
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;
  if (!isAuthenticated) return <div className="min-h-screen flex items-center justify-center"><Button asChild><a href={getLoginUrl()}>Sign in</a></Button></div>;

  const pendingPicks = (picksQuery.data || []).filter((p) => p.status === "pending");

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <AppNav />
      <main className="container py-8 max-w-lg mx-auto space-y-6">
        <div className="animate-fade-in-up">
          <h1 className="text-2xl font-serif font-semibold">בחירות יומיות</h1>
          <p className="text-muted-foreground text-sm mt-1">בחירות מיוחדות עבורך — מבוססות ערכים, לא נפח</p>
        </div>

        {picksQuery.isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {!picksQuery.isLoading && pendingPicks.length === 0 && (
          <div className="card-soft p-10 text-center space-y-3">
            <Heart className="w-10 h-10 text-muted-foreground mx-auto" />
            <p className="font-medium">אין בחירות חדשות להיום</p>
            <p className="text-sm text-muted-foreground">בחירות חדשות יגיעו מחר. בינתיים, גלה/י דרך Explore.</p>
            <Button asChild variant="outline" size="sm">
              <Link href="/explore">לדף Explore</Link>
            </Button>
          </div>
        )}

        {pendingPicks.map((pick) => {
          const profile = pick.profile;
          const media = profile?.media || [];
          const age = profile?.birthYear ? new Date().getFullYear() - profile.birthYear : null;
          const wmResult = whyMatchResult[pick.id];

          return (
            <div key={pick.id} className="card-soft overflow-hidden animate-fade-in-up">
              {/* Photo placeholder */}
              <div className="h-56 bg-gradient-to-br from-primary/10 to-accent/20 flex items-center justify-center">
                {media[0] ? (
                  <img src={media[0].url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-3xl font-serif text-primary">
                      {profile?.displayName?.[0] || "?"}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-5 space-y-4">
                {/* Name & basics */}
                <div>
                  <h3 className="text-xl font-serif font-semibold">
                    {profile?.displayName || "פרופיל חדש"}
                    {age && <span className="text-muted-foreground font-normal text-base mr-2">{age}</span>}
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile?.location && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />{profile.location}
                      </span>
                    )}
                    {profile?.observance && (
                      <span className="trust-badge">{profile.observance}</span>
                    )}
                    {profile?.relationshipIntent && (
                      <span className="trust-badge">{profile.relationshipIntent}</span>
                    )}
                  </div>
                </div>

                {/* Bio */}
                {profile?.bio && (
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{profile.bio}</p>
                )}

                {/* Why Match AI */}
                {wmResult ? (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-2 text-sm">
                    <div className="flex items-center gap-1.5 text-primary font-medium">
                      <Sparkles className="w-3.5 h-3.5" />
                      למה זה עשוי להיות קשר? (טיוטת AI)
                    </div>
                    <p className="text-foreground">{wmResult.explanation}</p>
                    {wmResult.sharedSignals.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {wmResult.sharedSignals.map((s, i) => (
                          <span key={i} className="trust-badge text-xs">{s}</span>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground italic">{wmResult.caveat}</p>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-xs text-primary w-full"
                    onClick={() => whyMatch.mutate({ matchId: pick.id })}
                    disabled={whyMatch.isPending}
                  >
                    {whyMatch.isPending && whyMatchTarget === pick.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    למה זה עשוי להיות קשר?
                  </Button>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2 border-destructive/30 text-destructive hover:bg-destructive/5"
                    onClick={() => passMutation.mutate({ targetUserId: pick.targetUserId })}
                    disabled={passMutation.isPending}
                  >
                    <X className="w-4 h-4" />
                    לא עכשיו
                  </Button>
                  <Button
                    className="flex-1 gap-2 bg-primary text-primary-foreground"
                    onClick={() => likeMutation.mutate({ targetUserId: pick.targetUserId })}
                    disabled={likeMutation.isPending}
                  >
                    <Heart className="w-4 h-4" />
                    מעניין/ת אותי
                  </Button>
                </div>

                {/* Report link */}
                <div className="text-center">
                  <Link href={`/safety-center?report=${pick.targetUserId}`}>
                    <button className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1 mx-auto">
                      <Shield className="w-3 h-3" />
                      דיווח על פרופיל זה
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}
