import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { AppNav } from "@/components/AppNav";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Users, Shield, Database, Sparkles, Loader2, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const statsQuery = trpc.admin.getStats.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;
  if (!isAuthenticated) return <div className="min-h-screen flex items-center justify-center"><Button asChild><a href={getLoginUrl()}>Sign in</a></Button></div>;
  if (user?.role !== "admin") return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">גישה מוגבלת — מנהלים בלבד</p></div>;

  const stats = statsQuery.data;

  const STAT_CARDS = [
    { label: "משתמשים רשומים", value: stats?.totalUsers ?? "—", icon: Users },
    { label: "פרופילים פעילים", value: stats?.activeProfiles ?? "—", icon: TrendingUp },
    { label: "דיווחים פתוחים", value: stats?.openReports ?? "—", icon: Shield },
    { label: "שיחות פעילות", value: stats?.activeConversations ?? "—", icon: Database },
  ];

  const ADMIN_LINKS = [
    { href: "/admin/users", icon: Users, label: "ניהול משתמשים" },
    { href: "/admin/audit", icon: Database, label: "יומן ביקורת" },
    { href: "/admin/ai", icon: Sparkles, label: "ממשל AI" },
    { href: "/mod/queue", icon: Shield, label: "תור מודרציה" },
  ];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <AppNav />
      <main className="container py-8 max-w-3xl mx-auto space-y-8">
        <div className="animate-fade-in-up">
          <h1 className="text-2xl font-serif font-semibold">לוח בקרה — מנהל</h1>
          <p className="text-muted-foreground text-sm mt-1">סקירה כללית של המערכת</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STAT_CARDS.map(({ label, value, icon: Icon }) => (
            <div key={label} className="card-soft p-4 space-y-2">
              <Icon className="w-5 h-5 text-primary" />
              <p className="text-2xl font-bold">{statsQuery.isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {ADMIN_LINKS.map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href}>
              <div className="card-soft p-5 text-center space-y-2 cursor-pointer hover:border-primary/40 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm font-medium">{label}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
