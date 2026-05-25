import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <Link href="/"><span className="font-serif text-2xl text-primary font-semibold cursor-pointer">קשר</span></Link>
          <Button asChild size="sm" className="bg-primary text-primary-foreground"><a href={getLoginUrl()}>כניסה</a></Button>
        </div>
      </header>
      <main className="container py-16 max-w-2xl mx-auto space-y-8">
        <div className="animate-fade-in-up">
          <h1 className="text-4xl font-serif font-semibold">תנאי שימוש</h1>
          <p className="text-muted-foreground mt-2">עדכון אחרון: ינואר 2025</p>
        </div>
        {[
          { title: "קבלת תנאים", body: "שימוש בשירות מהווה הסכמה לתנאים אלה. אם אינך מסכים/ה — אנא הימנע/י משימוש." },
          { title: "כשירות", body: "השירות מיועד לבני 18 ומעלה. שימוש על ידי קטינים אסור." },
          { title: "התנהגות אסורה", body: "אסורים: הטרדה, הונאה, פרסום תוכן מיני ללא הסכמה, ספאם, ייצוג כוזב, ושימוש לצרכים מסחריים ללא אישור." },
          { title: "הגבלת אחריות", body: "השירות ניתן כמות שהוא. אנו לא אחראים לנזקים שנגרמו מפגישות בין משתמשים." },
          { title: "סיום שירות", body: "אנו רשאים להשעות או לסגור חשבונות שמפרים תנאים אלה. ניתן למחוק חשבון בכל עת מהגדרות." },
        ].map(({ title, body }) => (
          <div key={title} className="space-y-2">
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-muted-foreground leading-relaxed">{body}</p>
          </div>
        ))}
      </main>
    </div>
  );
}
