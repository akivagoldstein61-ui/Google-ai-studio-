import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";
import { MessageCircle, Shield, Mail } from "lucide-react";

export default function SupportPage() {
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
          <h1 className="text-4xl font-serif font-semibold">תמיכה</h1>
          <p className="text-muted-foreground mt-2">אנחנו כאן לעזור.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Mail, title: "אימייל", desc: "support@kesher.app", sub: "מענה תוך 24 שעות" },
            { icon: Shield, title: "בטיחות", desc: "safety@kesher.app", sub: "דיווחי בטיחות בלבד" },
            { icon: Shield, title: "פרטיות", desc: "privacy@kesher.app", sub: "בקשות GDPR / חוק פרטיות" },
          ].map(({ icon: Icon, title, desc, sub }) => (
            <div key={title} className="card-soft p-5 space-y-2 text-center">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <p className="font-semibold">{title}</p>
              <p className="text-sm text-primary">{desc}</p>
              <p className="text-xs text-muted-foreground">{sub}</p>
            </div>
          ))}
        </div>
        <div className="card-soft p-6 space-y-4">
          <h2 className="font-semibold">שאלות נפוצות</h2>
          {[
            { q: "כיצד אוכל למחוק את החשבון שלי?", a: "הגדרות → הנתונים שלי → מחיקת חשבון." },
            { q: "כיצד אוכל לדווח על משתמש?", a: "לחץ/י על כפתור הדגל בכל פרופיל או הודעה." },
            { q: "כיצד אוכל לייצא את הנתונים שלי?", a: "הגדרות → הנתונים שלי → ייצוא נתונים." },
            { q: "כיצד אוכל לבטל הסכמה לכלי AI?", a: "מרכז אמון AI → הסכמות AI → בטל הסכמה." },
          ].map(({ q, a }) => (
            <div key={q} className="space-y-1 border-b border-border/50 pb-3 last:border-0 last:pb-0">
              <p className="font-medium text-sm">{q}</p>
              <p className="text-sm text-muted-foreground">{a}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
