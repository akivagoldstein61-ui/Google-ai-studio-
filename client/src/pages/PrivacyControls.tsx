import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { AppNav } from "@/components/AppNav";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { Lock, Loader2 } from "lucide-react";
import { Link } from "wouter";

export default function PrivacyControls() {
  const { isAuthenticated, loading } = useAuth();
  const profileQuery = trpc.profiles.get.useQuery(undefined, { enabled: isAuthenticated });
  const updatePrivacy = trpc.profiles.updatePrivacy.useMutation({
    onSuccess: () => { toast.success("הגדרות פרטיות עודכנו"); profileQuery.refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const [settings, setSettings] = useState({
    showAge: true,
    showLocation: true,
    allowSearchByName: false,
    profileVisibility: "matches_only",
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;
  if (!isAuthenticated) return <div className="min-h-screen flex items-center justify-center"><Button asChild><a href={getLoginUrl()}>Sign in</a></Button></div>;

  const Toggle = ({ checked, onChange, label, desc }: { checked: boolean; onChange: (v: boolean) => void; label: string; desc: string }) => (
    <div className="card-soft p-4 flex items-center justify-between gap-4">
      <div>
        <p className="font-medium text-sm">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${checked ? "bg-primary" : "bg-muted"}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : ""}`} />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <AppNav />
      <main className="container py-8 max-w-xl mx-auto space-y-6">
        <div className="flex items-center gap-3 animate-fade-in-up">
          <Link href="/settings"><Button variant="ghost" size="sm">← חזרה</Button></Link>
          <h1 className="text-2xl font-serif font-semibold">הגדרות פרטיות</h1>
        </div>

        <div className="space-y-3 animate-fade-in-up">
          <Toggle
            checked={settings.showAge}
            onChange={(v) => setSettings({ ...settings, showAge: v })}
            label="הצג גיל"
            desc="הצג/י את הגיל שלך בפרופיל"
          />
          <Toggle
            checked={settings.showLocation}
            onChange={(v) => setSettings({ ...settings, showLocation: v })}
            label="הצג מיקום"
            desc="הצג/י את המיקום הכללי שלך בפרופיל"
          />
          <Toggle
            checked={settings.allowSearchByName}
            onChange={(v) => setSettings({ ...settings, allowSearchByName: v })}
            label="חיפוש לפי שם"
            desc="אפשר/י לאחרים למצוא אותך לפי שם"
          />

          <div className="card-soft p-4 space-y-2">
            <p className="font-medium text-sm">נראות פרופיל</p>
            <div className="space-y-1.5">
              {[
                { value: "matches_only", label: "התאמות בלבד" },
                { value: "all_members", label: "כל החברים" },
                { value: "hidden", label: "מוסתר" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSettings({ ...settings, profileVisibility: opt.value })}
                  className={`w-full text-right px-3 py-2 rounded-lg text-sm border transition-colors ${settings.profileVisibility === opt.value ? "bg-primary/10 border-primary/40 text-primary" : "border-border hover:border-primary/30"}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <Button
            className="w-full bg-primary text-primary-foreground gap-2"
            onClick={() => updatePrivacy.mutate(settings)}
            disabled={updatePrivacy.isPending}
          >
            {updatePrivacy.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            שמור הגדרות
          </Button>
        </div>
      </main>
    </div>
  );
}
