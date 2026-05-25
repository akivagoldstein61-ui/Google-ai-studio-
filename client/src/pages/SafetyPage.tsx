import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Shield, AlertTriangle, Phone } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function SafetyPage() {
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
          <h1 className="text-4xl font-serif font-semibold">בטיחות בקשר</h1>
          <p className="text-muted-foreground mt-2">הבטיחות שלך היא העדיפות הראשונה שלנו.</p>
        </div>
        <div className="card-soft p-5 bg-destructive/5 border-destructive/20 space-y-3">
          <div className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-destructive" /><span className="font-semibold text-destructive">מצב חירום</span></div>
          <ul className="text-sm space-y-1"><li>• <strong>משטרה:</strong> 100</li><li>• <strong>מד"א:</strong> 101</li><li>• <strong>קו סיוע לנפגעות תקיפה מינית:</strong> 1202</li><li>• <strong>ער"ן:</strong> 1201</li></ul>
        </div>
        {[
          { title: "פגישה ראשונה", tips: ["פגשו במקום ציבורי", "הודיעו לחבר/ה על המיקום", "הסתדרו עם הגעה עצמאית", "אל תשתפו כתובת בית"] },
          { title: "זיהוי הונאות", tips: ["בקשת כסף — דגל אדום", "סירוב לשיחת וידאו — חשוד", "לחץ לפגישה מהירה — זהירות", "סיפורים לא עקביים"] },
          { title: "דיווח וחסימה", tips: ["דיווח זמין בכל פרופיל", "חסימה מיידית ללא הסבר", "כל דיווח נבדק על ידי אדם", "אנונימיות מלאה לדיווחים"] },
        ].map(({ title, tips }) => (
          <div key={title} className="card-soft p-5 space-y-3">
            <h3 className="font-semibold">{title}</h3>
            <ul className="space-y-1">{tips.map((t) => <li key={t} className="text-sm text-muted-foreground flex gap-2"><Shield className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />{t}</li>)}</ul>
          </div>
        ))}
      </main>
    </div>
  );
}
