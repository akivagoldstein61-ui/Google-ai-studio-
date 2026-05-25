import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { AppNav } from "@/components/AppNav";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Sparkles, Shield, Heart, MessageCircle, Users, Loader2, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import React from "react";

// Static skill definitions (canonical registry)
const SKILLS = [
  {
    slug: "bio-coach",
    title: "מאמן ביוגרפיה",
    category: "profile",
    desc: "קבל/י הצעות AI לשיפור הביוגרפיה שלך — בצורה אותנטית ומכובדת.",
    icon: Sparkles,
    status: "working",
    surface: "/profile/edit",
    privacy: "הצעות לא נשמרות. הביוגרפיה שלך נשארת שלך.",
  },
  {
    slug: "profile-completeness",
    title: "שלמות פרופיל",
    category: "profile",
    desc: "בדוק/י אילו חלקים בפרופיל חסרים ומה ישפר את הסיכוי לקשרים.",
    icon: CheckCircle2,
    status: "demo_safe",
    surface: "/profile/build",
    privacy: "ניתוח מקומי — לא נשלח לשרת חיצוני.",
  },
  {
    slug: "private-taste",
    title: "פרופיל טעם פרטי",
    category: "profile",
    desc: "ענה/י על שאלות ערכים בפרטיות. רק אתה/את רואה את התשובות.",
    icon: Lock,
    status: "working",
    surface: "/profile/build?step=values",
    privacy: "תשובות פרטיות לא משותפות ולא נחשפות לאחרים.",
    consentRequired: true,
  },
  {
    slug: "why-match",
    title: "למה זה קשר?",
    category: "matching",
    desc: "הסבר AI מדוע ההתאמה הזו עשויה להיות מעניינת — ללא חשיפת נתונים פרטיים.",
    icon: Heart,
    status: "working",
    surface: "/picks",
    privacy: "מבוסס רק על מידע ציבורי. לא חושף תשובות פרטיות.",
  },
  {
    slug: "message-safety",
    title: "בדיקת בטיחות הודעה",
    category: "messaging",
    desc: "סרוק/י הודעה לפני שליחה — זיהוי תבניות הונאה, לחץ, ובקשות לא הולמות.",
    icon: Shield,
    status: "working",
    surface: "/chat/:id",
    privacy: "ההודעה לא נשמרת לאחר הבדיקה.",
  },
  {
    slug: "rephrase",
    title: "ניסוח מחדש",
    category: "messaging",
    desc: "קבל/י 2-3 חלופות לניסוח ההודעה שלך. AI לא שולח אוטומטית.",
    icon: MessageCircle,
    status: "working",
    surface: "/chat/:id",
    privacy: "טיוטה בלבד. שליחה דורשת אישור ידני שלך.",
  },
  {
    slug: "openers",
    title: "פתיחות שיחה",
    category: "messaging",
    desc: "קבל/י הצעות לפתיחת שיחה מבוססות פרופיל ציבורי בלבד.",
    icon: MessageCircle,
    status: "working",
    surface: "/chat/:id",
    privacy: "מבוסס רק על מידע ציבורי. לא נשלח אוטומטית.",
  },
  {
    slug: "date-ideas",
    title: "רעיונות לפגישה",
    category: "messaging",
    desc: "קבל/י רעיונות לפגישה ראשונה מבוססי תחומי עניין משותפים.",
    icon: Heart,
    status: "working",
    surface: "/chat/:id",
    privacy: "לא דורש מיקום מדויק. כולל הערת בטיחות לפגישה ראשונה.",
  },
  {
    slug: "personality-summary",
    title: "סיכום ערכים",
    category: "reflection",
    desc: "קבל/י סיכום חם ולא-אבחוני של הערכים הציבוריים שלך.",
    icon: Users,
    status: "working",
    surface: "/skills/personality-summary",
    privacy: "מבוסס רק על תשובות ציבוריות. לא אבחון פסיכולוגי.",
    consentRequired: true,
  },
  {
    slug: "pair-insight",
    title: "תובנת זוג",
    category: "reflection",
    desc: "גלה/י תובנות על הדינמיקה הפוטנציאלית בינך לבין ההתאמה — בהסכמה הדדית.",
    icon: Users,
    status: "demo_safe",
    surface: "/match/:id",
    privacy: "דורש הסכמה הדדית. לא חושף נתונים פרטיים.",
    consentRequired: true,
  },
  {
    slug: "pacing",
    title: "קצב שיחה",
    category: "reflection",
    desc: "קבל/י הצעות עדינות לגבי קצב השיחה — ללא שיפוט.",
    icon: Sparkles,
    status: "working",
    surface: "/chat/:id",
    privacy: "מבוסס על מדדים כמותיים בלבד. לא קורא תוכן הודעות.",
  },
  {
    slug: "safety-advice",
    title: "עצות בטיחות",
    category: "safety",
    desc: "קבל/י עצות בטיחות לפגישה ראשונה, זיהוי הונאות, וגבולות בריאים.",
    icon: Shield,
    status: "working",
    surface: "/safety-center",
    privacy: "מידע כללי בלבד. לא מבוסס על נתוניך האישיים.",
  },
  {
    slug: "moderation-summary",
    title: "סיכום מודרציה",
    category: "moderation",
    desc: "כלי פנימי למנחים: טיוטת AI לסיכום דיווח. דורש החלטה אנושית.",
    icon: Shield,
    status: "working",
    surface: "/mod/case/:id",
    privacy: "פנימי בלבד. לא נחשף למשתמשים.",
    roleRequired: "moderator",
  },
  {
    slug: "photo-review",
    title: "בדיקת תמונה",
    category: "profile",
    desc: "בדיקת תמונת פרופיל — רק לאישור תאימות, ללא הסקת מסקנות על מאפיינים מוגנים.",
    icon: AlertCircle,
    status: "blocked",
    surface: null,
    privacy: "חסום — לא מיושם עד לאישור בטיחות מלא.",
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  profile: "פרופיל",
  matching: "התאמות",
  messaging: "הודעות",
  reflection: "הרהור",
  safety: "בטיחות",
  moderation: "מודרציה",
};

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  working: { label: "פעיל", cls: "skill-badge-working" },
  demo_safe: { label: "הדגמה", cls: "skill-badge-demo" },
  blocked: { label: "חסום", cls: "skill-badge-blocked" },
  needs_provider_setup: { label: "דורש הגדרה", cls: "skill-badge-setup" },
};

export default function SkillsHub() {
  const { user, isAuthenticated, loading } = useAuth();
  // Track which skills the user has tried (client-side state, persisted to localStorage)
  const [triedSkills, setTriedSkills] = React.useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem("kesher_tried_skills");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });

  const markTried = (slug: string) => {
    setTriedSkills((prev) => {
      const next = new Set(prev);
      next.add(slug);
      try { localStorage.setItem("kesher_tried_skills", JSON.stringify(Array.from(next))); } catch {}
      return next;
    });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;
  if (!isAuthenticated) return <div className="min-h-screen flex items-center justify-center"><Button asChild><a href={getLoginUrl()}>Sign in</a></Button></div>;

  const categories = Array.from(new Set(SKILLS.map((s) => s.category)));
  const visibleSkills = SKILLS.filter((s) => {
    if (s.roleRequired === "moderator") return user?.role === "moderator" || user?.role === "admin";
    return true;
  });

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <AppNav />
      <main className="container py-8 space-y-8">
        {/* Header */}
        <div className="max-w-2xl animate-fade-in-up">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="trust-badge">מרכז כישורי AI</span>
          </div>
          <h1 className="text-3xl font-serif font-semibold">מרכז הכישורים</h1>
          <p className="text-muted-foreground mt-2 leading-relaxed">
            כלי AI שנועדו לעזור לך להציג את עצמך בצורה אותנטית, לתקשר בצורה בריאה, ולהתחבר בביטחון.
            כל הכלים הם טיוטות בלבד — ההחלטה הסופית תמיד שלך.
          </p>
        </div>

        {/* Trust note */}
        <div className="card-soft p-4 flex items-start gap-3 bg-primary/5 border-primary/20 max-w-2xl">
          <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm space-y-1">
            <p className="font-medium">עקרונות AI של קשר</p>
            <ul className="text-muted-foreground space-y-0.5">
              <li>• AI לא שולח הודעות אוטומטית</li>
              <li>• AI לא חושף תשובות פרטיות</li>
              <li>• AI לא מאבחן אישיות</li>
              <li>• AI לא מקבל החלטות מודרציה</li>
              <li>• ניתן לאפס ולמחוק נתוני AI בכל עת</li>
            </ul>
          </div>
        </div>

        {/* User skill state summary */}
        {triedSkills.size > 0 && (
          <div className="card-soft p-4 flex items-center gap-3 bg-emerald-50/50 border-emerald-200/60 max-w-2xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <p className="text-sm text-emerald-700">
              ניסית {triedSkills.size} כישור{triedSkills.size > 1 ? "ים" : ""} עד כה.
              {triedSkills.size < 5 && " המשך/י לגלות עוד כלים שיעזרו לך."}
            </p>
            <button
              className="mr-auto text-xs text-muted-foreground hover:text-foreground underline"
              onClick={() => { setTriedSkills(new Set()); localStorage.removeItem("kesher_tried_skills"); }}
            >
              איפוס
            </button>
          </div>
        )}

        {/* Skills by category */}
        {categories.map((cat) => {
          const catSkills = visibleSkills.filter((s) => s.category === cat);
          if (catSkills.length === 0) return null;
          return (
            <div key={cat} className="space-y-3">
              <h2 className="text-lg font-semibold text-muted-foreground">{CATEGORY_LABELS[cat] || cat}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {catSkills.map((skill) => {
                  const Icon = skill.icon;
                  const statusInfo = STATUS_LABELS[skill.status];
                  const isBlocked = skill.status === "blocked";
                  return (
                    <div
                      key={skill.slug}
                      className={`card-soft p-5 space-y-3 ${isBlocked ? "opacity-60" : "hover:border-primary/40 hover:shadow-md transition-all"}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusInfo.cls}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm">{skill.title}</h3>
                          {skill.consentRequired && (
                            <span className="text-xs text-muted-foreground border border-border rounded px-1">דורש הסכמה</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{skill.desc}</p>
                      </div>
                      {skill.privacy && (
                        <p className="text-xs text-muted-foreground border-t border-border/50 pt-2 flex items-start gap-1">
                          <Lock className="w-3 h-3 flex-shrink-0 mt-0.5" />
                          {skill.privacy}
                        </p>
                      )}
                      {!isBlocked && skill.surface && (
                        <Link href={`/skills/${skill.slug}`} onClick={() => markTried(skill.slug)}>
                          <Button variant="outline" size="sm" className="w-full text-xs gap-1.5">
                            {triedSkills.has(skill.slug) && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                            {triedSkills.has(skill.slug) ? "פתח שוב" : "פתח כישור"}
                          </Button>
                        </Link>
                      )}
                      {isBlocked && (
                        <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground" disabled>
                          חסום — לא זמין
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}
