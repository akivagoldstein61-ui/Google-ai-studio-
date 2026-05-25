import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { AppNav } from "@/components/AppNav";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Heart, MessageCircle, Compass, Sparkles, Shield, ArrowLeft, CheckCircle2 } from "lucide-react";

const QUICK_ACTIONS = [
  { href: "/picks", icon: Heart, label: "Daily Picks", labelHe: "בחירות יומיות", desc: "See today's curated matches" },
  { href: "/inbox", icon: MessageCircle, label: "Inbox", labelHe: "תיבת דואר", desc: "Your conversations" },
  { href: "/explore", icon: Compass, label: "Explore", labelHe: "גלה/י", desc: "Browse profiles" },
  { href: "/skills", icon: Sparkles, label: "Skills Hub", labelHe: "מרכז כישורים", desc: "AI-powered tools for you" },
];

export default function HomeDashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const profileQuery = trpc.profiles.get.useQuery(undefined, { enabled: isAuthenticated });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-serif">Welcome to Kesher</h2>
          <p className="text-muted-foreground">Please sign in to continue.</p>
          <Button asChild><a href={getLoginUrl()}>Sign in</a></Button>
        </div>
      </div>
    );
  }

  const profile = profileQuery.data?.profile;
  const isProfileComplete = profile?.isComplete;

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <AppNav />
      <main className="container py-8 space-y-8">
        {/* Welcome */}
        <div className="animate-fade-in-up">
          <h1 className="text-3xl font-serif font-semibold">
            שלום, {user?.name?.split(" ")[0] || "חבר/ה"} 👋
          </h1>
          <p className="text-muted-foreground mt-1">ברוך/ה הבא/ה לקשר</p>
        </div>

        {/* Profile completion nudge */}
        {!isProfileComplete && (
          <div className="card-soft p-5 border-primary/30 bg-primary/5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">השלם/י את הפרופיל שלך</h3>
              <p className="text-sm text-muted-foreground mt-1">
                פרופיל מלא מגדיל משמעותית את הסיכוי לקשרים אמיתיים.
              </p>
            </div>
            <Button asChild size="sm" className="flex-shrink-0">
              <Link href="/profile/build">
                <ArrowLeft className="w-4 h-4 ml-1" />
                השלם/י
              </Link>
            </Button>
          </div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {QUICK_ACTIONS.map(({ href, icon: Icon, label, labelHe, desc }) => (
            <Link key={href} href={href}>
              <div className="card-soft p-5 space-y-3 cursor-pointer hover:border-primary/40 hover:shadow-md transition-all group">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{labelHe}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Safety reminder */}
        <div className="card-soft p-4 flex items-center gap-3 bg-muted/30">
          <Shield className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            תמיד ניתן{" "}
            <Link href="/safety-center" className="text-primary underline-offset-2 hover:underline">
              לדווח, לחסום, או לקבל עזרה
            </Link>{" "}
            — בכל שלב.
          </p>
        </div>
      </main>
    </div>
  );
}
