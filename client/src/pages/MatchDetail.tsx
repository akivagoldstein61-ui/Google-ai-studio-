import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { AppNav } from "@/components/AppNav";
import { trpc } from "@/lib/trpc";
import { useParams, Link } from "wouter";
import { toast } from "sonner";
import { useState } from "react";
import { Heart, MessageCircle, Shield, Sparkles, Loader2, MapPin, Flag } from "lucide-react";
import { Streamdown } from "streamdown";

export default function MatchDetail() {
  const { id } = useParams<{ id: string }>();
  const matchId = parseInt(id || "0");
  const { isAuthenticated, loading } = useAuth();

  const matchQuery = trpc.matches.getById.useQuery({ id: matchId }, { enabled: isAuthenticated && matchId > 0 });
  const pairInsight = trpc.ai.pairInsight.useMutation();
  const [insightResult, setInsightResult] = useState<{ insight: string; caveat: string } | null>(null);
  const [consentGiven, setConsentGiven] = useState(false);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;
  if (!isAuthenticated) return <div className="min-h-screen flex items-center justify-center"><Button asChild><a href={getLoginUrl()}>Sign in</a></Button></div>;

  const match = matchQuery.data;
  const profile = match?.otherProfile;
  const age = profile?.birthYear ? new Date().getFullYear() - profile.birthYear : null;

  const handlePairInsight = async () => {
    if (!consentGiven) { toast.error("אנא אשר/י את ההסכמה תחילה"); return; }
    const result = await pairInsight.mutateAsync({ matchId });
    setInsightResult(result);
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <AppNav />
      <main className="container py-8 max-w-lg mx-auto space-y-6">
        <Link href="/picks">
          <Button variant="ghost" size="sm">← חזרה לבחירות</Button>
        </Link>

        {matchQuery.isLoading && <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}

        {profile && (
          <div className="card-soft overflow-hidden animate-fade-in-up">
            {/* Photo */}
            <div className="h-64 bg-gradient-to-br from-primary/10 to-accent/20 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-4xl font-serif text-primary">{profile.displayName?.[0] || "?"}</span>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <h1 className="text-2xl font-serif font-semibold">
                  {profile.displayName}
                  {age && <span className="text-muted-foreground font-normal text-lg mr-2">{age}</span>}
                </h1>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.location && <span className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="w-3 h-3" />{profile.location}</span>}
                  {profile.observance && <span className="trust-badge">{profile.observance}</span>}
                  {profile.relationshipIntent && <span className="trust-badge">{profile.relationshipIntent}</span>}
                </div>
              </div>

              {profile.bio && (
                <div>
                  <p className="text-sm font-medium mb-1">אודות</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{profile.bio}</p>
                </div>
              )}

              {/* Pair Insight AI — requires consent */}
              <div className="border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold">תובנת זוג (AI)</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  תובנה על הדינמיקה הפוטנציאלית בינכם — מבוססת על מידע ציבורי בלבד.
                  לא חושפת נתונים פרטיים. טיוטה בלבד.
                </p>
                {!insightResult ? (
                  <div className="space-y-2">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={consentGiven}
                        onChange={(e) => setConsentGiven(e.target.checked)}
                        className="mt-0.5"
                      />
                      <span className="text-xs text-muted-foreground">
                        אני מסכים/ה לשימוש במידע הציבורי שלי ליצירת תובנת זוג זו.
                      </span>
                    </label>
                    <Button
                      size="sm"
                      className="w-full gap-2 bg-primary text-primary-foreground"
                      onClick={handlePairInsight}
                      disabled={pairInsight.isPending || !consentGiven}
                    >
                      {pairInsight.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      צור תובנת זוג
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2 animate-fade-in-up">
                    <Streamdown>{insightResult.insight}</Streamdown>
                    <p className="text-xs text-muted-foreground italic">{insightResult.caveat}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button asChild className="flex-1 gap-2 bg-primary text-primary-foreground">
                  <Link href={`/chat/${matchId}`}>
                    <MessageCircle className="w-4 h-4" />
                    שלח/י הודעה
                  </Link>
                </Button>
              </div>

              {/* Report */}
              <div className="text-center">
                <Link href={`/safety-center?report=${match?.otherUserId}`}>
                  <button className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1 mx-auto">
                    <Flag className="w-3 h-3" />
                    דיווח על פרופיל זה
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
