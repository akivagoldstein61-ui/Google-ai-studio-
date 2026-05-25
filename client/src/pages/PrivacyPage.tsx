import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Lock } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function PrivacyPage() {
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
          <h1 className="text-4xl font-serif font-semibold">מדיניות פרטיות</h1>
          <p className="text-muted-foreground mt-2">עדכון אחרון: ינואר 2025</p>
        </div>
        {[
          { title: "מה אנו אוספים", body: "אנו אוספים את המידע שאתה/את מספק/ת בעת יצירת פרופיל: שם, גיל, מיקום כללי, ביוגרפיה, והעדפות. אנו לא אוספים מיקום GPS מדויק ללא הסכמה מפורשת." },
          { title: "כיצד אנו משתמשים במידע", body: "המידע משמש להתאמות, לשיפור השירות, ולבטיחות הקהילה. אנו לא מוכרים מידע לצדדים שלישיים לצורכי פרסום." },
          { title: "כלי AI", body: "כלי ה-AI שלנו מעבדים מידע ציבורי בלבד. תשובות פרטיות לא נחשפות לאחרים. ניתן לבטל הסכמה לכלי AI בכל עת." },
          { title: "זכויותיך", body: "לפי חוק הגנת הפרטיות הישראלי (תיקון 13), יש לך זכות עיון, תיקון, מחיקה, והתנגדות לעיבוד. פנה/י אלינו בכתב לכתובת privacy@kesher.app." },
          { title: "שמירת נתונים", body: "נתונים נשמרים כל עוד החשבון פעיל. לאחר מחיקת חשבון, הנתונים נמחקים תוך 30 יום." },
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
