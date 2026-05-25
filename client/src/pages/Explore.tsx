import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { AppNav } from "@/components/AppNav";
import { Compass } from "lucide-react";

export default function Explore() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;
  if (!isAuthenticated) return <div className="min-h-screen flex items-center justify-center"><Button asChild><a href={getLoginUrl()}>Sign in</a></Button></div>;

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <AppNav />
      <main className="container py-8 max-w-lg mx-auto">
        <div className="animate-fade-in-up space-y-4">
          <h1 className="text-2xl font-serif font-semibold">גלה/י</h1>
          <p className="text-muted-foreground text-sm">עיון בפרופילים — מבוסס ערכים, לא מראה חיצוני</p>
          <div className="card-soft p-10 text-center space-y-3">
            <Compass className="w-10 h-10 text-muted-foreground mx-auto" />
            <p className="font-medium">Explore בפיתוח</p>
            <p className="text-sm text-muted-foreground">
              בינתיים, השתמש/י בבחירות היומיות שלך. Explore יהיה זמין בקרוב.
            </p>
            <span className="trust-badge mx-auto w-fit">Feature coming soon</span>
          </div>
        </div>
      </main>
    </div>
  );
}
