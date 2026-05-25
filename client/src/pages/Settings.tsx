import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { AppNav } from "@/components/AppNav";
import { Link } from "wouter";
import { Shield, Lock, Database, User, ChevronLeft } from "lucide-react";

const SETTINGS_SECTIONS = [
  {
    href: "/profile/edit",
    icon: User,
    title: "פרופיל",
    desc: "עדכן/י את הפרופיל, הביוגרפיה, והעדפות",
  },
  {
    href: "/settings/privacy",
    icon: Lock,
    title: "פרטיות",
    desc: "שלוט/י במה שנראה ומי יכול לראות אותך",
  },
  {
    href: "/settings/consent",
    icon: Shield,
    title: "הסכמות",
    desc: "נהל/י הסכמות לעיבוד נתונים ושיתוף",
  },
  {
    href: "/settings/data",
    icon: Database,
    title: "הנתונים שלי",
    desc: "ייצוא, תיקון, ומחיקת הנתונים שלך",
  },
  {
    href: "/trust",
    icon: Shield,
    title: "מרכז אמון AI",
    desc: "נהל/י הסכמות AI ועיין/י בנתוני AI",
  },
];

export default function Settings() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;
  if (!isAuthenticated) return <div className="min-h-screen flex items-center justify-center"><Button asChild><a href={getLoginUrl()}>Sign in</a></Button></div>;

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <AppNav />
      <main className="container py-8 max-w-xl mx-auto space-y-6">
        <div className="animate-fade-in-up">
          <h1 className="text-2xl font-serif font-semibold">הגדרות</h1>
        </div>
        <div className="space-y-2">
          {SETTINGS_SECTIONS.map(({ href, icon: Icon, title, desc }) => (
            <Link key={href} href={href}>
              <div className="card-soft p-4 flex items-center gap-4 cursor-pointer hover:border-primary/40 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{title}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <ChevronLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
