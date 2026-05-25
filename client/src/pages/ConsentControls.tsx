import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { AppNav } from "@/components/AppNav";
import { Link } from "wouter";
import { Shield } from "lucide-react";

export default function ConsentControls() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;
  if (!isAuthenticated) return <div className="min-h-screen flex items-center justify-center"><Button asChild><a href={getLoginUrl()}>Sign in</a></Button></div>;

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <AppNav />
      <main className="container py-8 max-w-xl mx-auto space-y-6">
        <div className="flex items-center gap-3 animate-fade-in-up">
          <Link href="/settings"><Button variant="ghost" size="sm">← חזרה</Button></Link>
          <h1 className="text-2xl font-serif font-semibold">הסכמות</h1>
        </div>
        <div className="card-soft p-6 text-center space-y-3 animate-fade-in-up">
          <Shield className="w-10 h-10 text-primary mx-auto" />
          <p className="font-medium">ניהול הסכמות AI</p>
          <p className="text-sm text-muted-foreground">
            ניהול הסכמות AI מלא זמין במרכז אמון AI.
          </p>
          <Button asChild className="bg-primary text-primary-foreground">
            <Link href="/trust">עבור/י למרכז אמון AI</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
