import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Heart, Shield, Sparkles } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function About() {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <Link href="/"><span className="font-serif text-2xl text-primary font-semibold cursor-pointer">קשר</span></Link>
          <Button asChild size="sm" className="bg-primary text-primary-foreground"><a href={getLoginUrl()}>כניסה</a></Button>
        </div>
      </header>
      <main className="container py-16 max-w-2xl mx-auto space-y-10">
        <div className="space-y-4 animate-fade-in-up">
          <h1 className="text-4xl font-serif font-semibold">אודות קשר</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            קשר היא אפליקציית הכרויות ישראלית שנבנתה על ערכים של כבוד, אותנטיות, ובטיחות.
            אנו מאמינים שמערכות יחסים בריאות מתחילות בהצגה עצמית כנה — לא בשיווק עצמי.
          </p>
        </div>
        {[
          { icon: Heart, title: "הכרויות מכוונות", desc: "אנו מציעים בחירות יומיות מיוחדות — לא גלילה אינסופית. כי כמות אינה איכות." },
          { icon: Sparkles, title: "AI שקוף ואחראי", desc: "כלי ה-AI שלנו הם עוזרים, לא מחליטים. כל הצעה מוסברת, ניתן לבטל בכל עת." },
          { icon: Shield, title: "בטיחות מובנית", desc: "מודרציה אנושית, דיווח קל, וחסימה מיידית — בכל שלב." },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="card-soft p-6 flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
