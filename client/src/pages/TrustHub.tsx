import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { AppNav } from "@/components/AppNav";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { Shield, Sparkles, Lock, Eye, Trash2, RefreshCw, Loader2, CheckCircle2, XCircle } from "lucide-react";

const AI_FEATURES = [
  { key: "bioCoach", label: "מאמן ביוגרפיה", desc: "הצעות AI לשיפור הביוגרפיה שלך" },
  { key: "whyMatch", label: "למה זה קשר?", desc: "הסבר AI על התאמות" },
  { key: "messageSafety", label: "בדיקת בטיחות הודעה", desc: "סריקת הודעות לפני שליחה" },
  { key: "rephrase", label: "ניסוח מחדש", desc: "חלופות לניסוח הודעות" },
  { key: "openers", label: "פתיחות שיחה", desc: "הצעות לפתיחת שיחה" },
  { key: "dateIdeas", label: "רעיונות לפגישה", desc: "הצעות לפגישה ראשונה" },
  { key: "personalitySummary", label: "סיכום ערכים", desc: "סיכום ערכים ציבוריים" },
  { key: "pairInsight", label: "תובנת זוג", desc: "תובנות על דינמיקה פוטנציאלית" },
];

export default function TrustHub() {
  const { isAuthenticated, loading } = useAuth();
  const consentQuery = trpc.consent.getConsents.useQuery(undefined, { enabled: isAuthenticated });
  const historyQuery = trpc.consent.getConsentHistory.useQuery(undefined, { enabled: isAuthenticated });
  const grantConsent = trpc.consent.grantConsent.useMutation({ onSuccess: () => consentQuery.refetch() });
  const revokeConsent = trpc.consent.revokeConsent.useMutation({ onSuccess: () => { toast.success("הסכמה בוטלה"); consentQuery.refetch(); } });
  const deleteAIData = trpc.consent.deleteAIData.useMutation({ onSuccess: () => toast.success("נתוני AI נמחקו") });
  const exportData = trpc.consent.exportData.useMutation({ onSuccess: (data) => { const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "kesher-my-data.json"; a.click(); } });

  const [activeTab, setActiveTab] = useState<"overview" | "grants" | "history" | "data" | "rights">("overview");

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;
  if (!isAuthenticated) return <div className="min-h-screen flex items-center justify-center"><Button asChild><a href={getLoginUrl()}>Sign in</a></Button></div>;

  const consents = consentQuery.data?.consents || [];
  const getConsent = (key: string) => consents.find((c) => c.consentType === key && c.granted === true);

  const TABS = [
    { id: "overview", label: "סקירה" },
    { id: "grants", label: "הסכמות AI" },
    { id: "history", label: "יומן הסכמות" },
    { id: "data", label: "הנתונים שלי" },
    { id: "rights", label: "זכויותי" },
  ];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <AppNav />
      <main className="container py-8 max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="animate-fade-in-up">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="trust-badge">מרכז אמון AI</span>
          </div>
          <h1 className="text-2xl font-serif font-semibold">מרכז אמון AI</h1>
          <p className="text-muted-foreground text-sm mt-1">
            שלוט/י בכל ההסכמות, הנתונים, וכלי ה-AI שלך — במקום אחד.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted/50 p-1 rounded-xl">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {activeTab === "overview" && (
          <div className="space-y-4 animate-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: Sparkles, title: "AI לא שולח אוטומטית", desc: "כל הצעת AI דורשת אישור ידני שלך לפני שליחה." },
                { icon: Lock, title: "נתונים פרטיים נשארים פרטיים", desc: "תשובות פרטיות לא נחשפות לאחרים ולא משמשות להסברים." },
                { icon: Eye, title: "שקיפות מלאה", desc: "כל הסבר AI מציין מאיזה מקור הגיע המידע." },
                { icon: Shield, title: "מודרציה אנושית", desc: "AI לא מקבל החלטות מודרציה — תמיד יש אדם בלולאה." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="card-soft p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold">{title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grants tab */}
        {activeTab === "grants" && (
          <div className="space-y-3 animate-fade-in-up">
            <p className="text-sm text-muted-foreground">
              ניהול הסכמות לכלי AI. ביטול הסכמה עוצר שימוש עתידי ומוחק נתונים שנאספו.
            </p>
            {consentQuery.isLoading && <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}
            {AI_FEATURES.map((feature) => {
              const granted = getConsent(feature.key);
              return (
                <div key={feature.key} className="card-soft p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{feature.label}</p>
                    <p className="text-xs text-muted-foreground">{feature.desc}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {granted ? (
                      <>
                        <span className="flex items-center gap-1 text-xs text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          פעיל
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs border-destructive/30 text-destructive hover:bg-destructive/5"
                          onClick={() => revokeConsent.mutate({ featureKey: feature.key })}
                          disabled={revokeConsent.isPending}
                        >
                          <XCircle className="w-3.5 h-3.5 ml-1" />
                          בטל
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <XCircle className="w-3.5 h-3.5" />
                          כבוי
                        </span>
                        <Button
                          size="sm"
                          className="text-xs bg-primary text-primary-foreground"
                          onClick={() => grantConsent.mutate({ featureKey: feature.key })}
                          disabled={grantConsent.isPending}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 ml-1" />
                          הפעל
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Consent History tab */}
        {activeTab === "history" && (
          <div className="space-y-4 animate-fade-in-up">
            <p className="text-sm text-muted-foreground">
              יומן כל שינויי ההסכמה שביצעת. נשמר 5 שנים לפי חוק הגנת הפרטיות.
            </p>
            {historyQuery.isLoading && <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}
            {!historyQuery.isLoading && (historyQuery.data?.history ?? []).length === 0 && (
              <div className="card-soft p-8 text-center space-y-2">
                <Shield className="w-8 h-8 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">אין שינויי הסכמה עדיין. שינויים יופיעו כאן לאחר הפעלה או ביטול של הסכמה.</p>
              </div>
            )}
            <div className="space-y-2">
              {(historyQuery.data?.history ?? []).map((entry, i) => (
                <div key={i} className="card-soft p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">
                      {(entry.details as any)?.feature ?? "כללי"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(entry.createdAt).toLocaleString("he-IL")}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    entry.action === "consent_granted" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                  }`}>
                    {entry.action === "consent_granted" ? "הסכמה ניתנה" : "הסכמה בוטלה"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Data tab */}
        {activeTab === "data" && (
          <div className="space-y-4 animate-fade-in-up">
            <p className="text-sm text-muted-foreground">
              נתוני AI שנאספו עבורך. ניתן לייצא או למחוק בכל עת.
            </p>
            <div className="space-y-3">
              <div className="card-soft p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">ייצוא כל הנתונים</p>
                  <p className="text-xs text-muted-foreground">קבל/י קובץ JSON עם כל הנתונים שלך</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => exportData.mutate()}
                  disabled={exportData.isPending}
                >
                  {exportData.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  ייצוא
                </Button>
              </div>
              <div className="card-soft p-4 flex items-center justify-between border-destructive/20">
                <div>
                  <p className="font-medium text-sm text-destructive">מחיקת נתוני AI</p>
                  <p className="text-xs text-muted-foreground">מחק/י את כל נתוני ה-AI שנאספו. לא ניתן לשחזר.</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/5"
                  onClick={() => { if (confirm("האם אתה/את בטוח/ה? פעולה זו אינה הפיכה.")) deleteAIData.mutate(); }}
                  disabled={deleteAIData.isPending}
                >
                  {deleteAIData.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  מחק
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Rights tab */}
        {activeTab === "rights" && (
          <div className="space-y-4 animate-fade-in-up">
            <p className="text-sm text-muted-foreground">
              זכויותיך לפי חוק הגנת הפרטיות הישראלי (תיקון 13) ותקנות GDPR.
            </p>
            {[
              { title: "זכות עיון", desc: "ניתן לייצא את כל הנתונים שלך בכל עת מלשונית 'הנתונים שלי'." },
              { title: "זכות תיקון", desc: "ניתן לעדכן את פרטיך בכל עת דרך עמוד הפרופיל." },
              { title: "זכות מחיקה", desc: "ניתן למחוק את החשבון ואת כל הנתונים מהגדרות הפרטיות." },
              { title: "זכות ביטול הסכמה", desc: "ניתן לבטל כל הסכמה בכל עת מלשונית 'הסכמות AI'." },
              { title: "זכות התנגדות לעיבוד", desc: "ניתן לפנות אלינו בכתב לכתובת privacy@kesher.app." },
              { title: "פנייה לרשות להגנת הפרטיות", desc: "ניתן לפנות לרשות להגנת הפרטיות של ישראל בכתובת gov.il/he/departments/the_privacy_protection_authority." },
            ].map(({ title, desc }) => (
              <div key={title} className="card-soft p-4 space-y-1">
                <p className="font-semibold text-sm">{title}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
