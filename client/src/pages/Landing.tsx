import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Heart, Shield, Sparkles, Users, ArrowLeft } from "lucide-react";

const FEATURES = [
  {
    icon: Heart,
    title: "Intentional Matching",
    titleHe: "הכרויות מכוונות",
    desc: "Daily curated picks based on values, not swipe volume.",
  },
  {
    icon: Sparkles,
    title: "AI Skills Hub",
    titleHe: "מרכז כישורי AI",
    desc: "Private tools to help you show up authentically — bio coaching, conversation openers, and more.",
  },
  {
    icon: Shield,
    title: "Safety First",
    titleHe: "בטיחות קודם",
    desc: "Report, block, and get safety advice at every step. Moderated by humans.",
  },
  {
    icon: Users,
    title: "Dignity by Design",
    titleHe: "כבוד בעיצוב",
    desc: "No swipe addiction, no desirability scores, no casino mechanics.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <span className="font-serif text-2xl text-primary font-semibold">קשר</span>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/about" className="hover:text-foreground transition-colors">אודות</Link>
            <Link href="/safety" className="hover:text-foreground transition-colors">בטיחות</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">פרטיות</Link>
          </nav>
          <Button asChild className="bg-primary text-primary-foreground">
            <a href={getLoginUrl()}>כניסה / הרשמה</a>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="container py-24 md:py-32">
        <div className="max-w-2xl mx-auto text-center space-y-8 animate-fade-in-up">
          <div className="trust-badge mx-auto w-fit">
            <Shield className="w-3.5 h-3.5" />
            <span>אפליקציית הכרויות ישראלית — מבוססת ערכים</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-serif font-semibold leading-tight text-balance">
            קשרים אמיתיים,<br />
            <span className="text-primary">מתחילים בכנות</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed text-balance">
            קשר היא אפליקציית הכרויות ישראלית שמאמינה שמערכות יחסים בריאות מתחילות בהצגה עצמית אותנטית,
            בכבוד הדדי ובבטיחות מובנית.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="bg-primary text-primary-foreground text-base px-8">
              <a href={getLoginUrl()}>
                <ArrowLeft className="w-5 h-5 ml-2" />
                התחל/י את המסע
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base px-8">
              <Link href="/about">למד/י עוד</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {FEATURES.map(({ icon: Icon, title, titleHe, desc }) => (
            <div key={title} className="card-soft p-6 space-y-3 hover:shadow-lg transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{titleHe}</h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust section */}
      <section className="bg-secondary/50 border-y border-border py-16">
        <div className="container max-w-2xl mx-auto text-center space-y-4">
          <h2 className="text-2xl font-serif font-semibold">בנויה על אמון</h2>
          <p className="text-muted-foreground leading-relaxed">
            כל תכונת AI מוסברת בשקיפות. הנתונים הפרטיים שלך נשארים פרטיים.
            אתה/את שולט/ת במה שמשותף ועם מי. ניתן לבטל הסכמה בכל עת.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {["ללא ניקוד רצויות", "ללא מכניקת קזינו", "AI שקוף", "מודרציה אנושית"].map((t) => (
              <span key={t} className="trust-badge">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container py-12 text-center text-sm text-muted-foreground">
        <div className="flex flex-wrap gap-6 justify-center mb-4">
          <Link href="/about" className="hover:text-foreground transition-colors">אודות</Link>
          <Link href="/safety" className="hover:text-foreground transition-colors">בטיחות</Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">פרטיות</Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">תנאי שימוש</Link>
          <Link href="/support" className="hover:text-foreground transition-colors">תמיכה</Link>
        </div>
        <p>© 2025 Kesher — קשר. כל הזכויות שמורות.</p>
      </footer>
    </div>
  );
}
