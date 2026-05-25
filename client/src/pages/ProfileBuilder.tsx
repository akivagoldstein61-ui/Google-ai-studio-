import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { AppNav } from "@/components/AppNav";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { Streamdown } from "streamdown";

const OBSERVANCE_OPTIONS = ["חילוני", "מסורתי", "דתי-לאומי", "חרדי", "אחר"];
const INTENT_OPTIONS = ["נישואין", "מערכת יחסים רצינית", "חברות ראשונה", "לא בטוח/ה"];
const GENDER_OPTIONS = ["גבר", "אישה", "לא בינארי/ת", "אחר"];

export default function ProfileBuilder() {
  const { isAuthenticated, loading } = useAuth();
  const profileQuery = trpc.profiles.get.useQuery(undefined, { enabled: isAuthenticated });
  const updateProfile = trpc.profiles.update.useMutation({
    onSuccess: () => {
      toast.success("הפרופיל עודכן בהצלחה");
      profileQuery.refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const bioCoach = trpc.ai.bioCoach.useMutation();

  const existing = profileQuery.data?.profile;
  const [form, setForm] = useState({
    displayName: existing?.displayName || "",
    bio: existing?.bio || "",
    birthYear: existing?.birthYear || new Date().getFullYear() - 30,
    gender: existing?.gender || "",
    location: existing?.location || "",
    observance: existing?.observance || "",
    relationshipIntent: existing?.relationshipIntent || "",
  });
  const [aiSuggestions, setAiSuggestions] = useState<{ suggestions: string[]; questions: string[]; tone_note: string } | null>(null);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;
  if (!isAuthenticated) return <div className="min-h-screen flex items-center justify-center"><Button asChild><a href={getLoginUrl()}>Sign in</a></Button></div>;

  const handleBioCoach = async () => {
    const result = await bioCoach.mutateAsync({ currentBio: form.bio, intent: form.relationshipIntent });
    setAiSuggestions(result);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(form);
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <AppNav />
      <main className="container py-8 max-w-xl mx-auto">
        <div className="space-y-6 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-serif font-semibold">בניית פרופיל</h1>
            <p className="text-muted-foreground text-sm mt-1">הצג/י את עצמך בצורה אותנטית ומכובדת</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Display name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">שם תצוגה</label>
              <input
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                placeholder="השם שיופיע לאחרים"
                maxLength={100}
              />
            </div>

            {/* Birth year */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">שנת לידה</label>
              <input
                type="number"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={form.birthYear}
                onChange={(e) => setForm({ ...form, birthYear: parseInt(e.target.value) })}
                min={1940}
                max={2005}
              />
            </div>

            {/* Gender */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">מגדר</label>
              <div className="flex flex-wrap gap-2">
                {GENDER_OPTIONS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setForm({ ...form, gender: g })}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${form.gender === g ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/50"}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Observance */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">זהות דתית</label>
              <div className="flex flex-wrap gap-2">
                {OBSERVANCE_OPTIONS.map((o) => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => setForm({ ...form, observance: o })}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${form.observance === o ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/50"}`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>

            {/* Relationship intent */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">מה אתה/את מחפש/ת?</label>
              <div className="flex flex-wrap gap-2">
                {INTENT_OPTIONS.map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setForm({ ...form, relationshipIntent: i })}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${form.relationshipIntent === i ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/50"}`}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">מיקום (כללי)</label>
              <input
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="לדוגמה: תל אביב, ירושלים"
                maxLength={200}
              />
            </div>

            {/* Bio with AI coach */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">אודותיי</label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-xs text-primary"
                  onClick={handleBioCoach}
                  disabled={bioCoach.isPending}
                >
                  {bioCoach.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  מאמן ביוגרפיה AI
                </Button>
              </div>
              <textarea
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                rows={4}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="ספר/י על עצמך — תחביבים, ערכים, מה שחשוב לך..."
                maxLength={2000}
              />
              <p className="text-xs text-muted-foreground text-left">{form.bio.length}/2000</p>
            </div>

            {/* AI Suggestions */}
            {aiSuggestions && (
              <div className="card-soft p-4 space-y-3 bg-primary/5 border-primary/20 animate-fade-in-up">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-primary">הצעות מאמן ה-AI (טיוטה לבדיקתך)</span>
                </div>
                {aiSuggestions.tone_note && (
                  <p className="text-xs text-muted-foreground italic">{aiSuggestions.tone_note}</p>
                )}
                {aiSuggestions.suggestions.length > 0 && (
                  <div>
                    <p className="text-xs font-medium mb-1.5">הצעות לשיפור:</p>
                    <ul className="space-y-1">
                      {aiSuggestions.suggestions.map((s, i) => (
                        <li key={i} className="text-sm text-foreground flex gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiSuggestions.questions.length > 0 && (
                  <div>
                    <p className="text-xs font-medium mb-1.5">שאלות לחשיבה:</p>
                    <ul className="space-y-1">
                      {aiSuggestions.questions.map((q, i) => (
                        <li key={i} className="text-sm text-muted-foreground">• {q}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="text-xs text-muted-foreground border-t border-border/50 pt-2">
                  אלו הצעות בלבד — ההחלטה הסופית היא שלך.
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground"
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
              שמור פרופיל
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
