import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { AppNav } from "@/components/AppNav";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { Users, Loader2, Shield, UserX } from "lucide-react";

export default function AdminUsers() {
  const { user, isAuthenticated, loading } = useAuth();
  const usersQuery = trpc.admin.listUsers.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin" });
  const updateRole = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => { toast.success("תפקיד עודכן"); usersQuery.refetch(); },
    onError: (e) => toast.error(e.message),
  });
  const suspendUser = trpc.admin.suspendUser.useMutation({
    onSuccess: () => { toast.success("משתמש הושעה"); usersQuery.refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const [search, setSearch] = useState("");

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;
  if (!isAuthenticated) return <div className="min-h-screen flex items-center justify-center"><Button asChild><a href={getLoginUrl()}>Sign in</a></Button></div>;
  if (user?.role !== "admin") return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">גישה מוגבלת</p></div>;

  const users = (usersQuery.data || []).filter((u: any) =>
    !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <AppNav />
      <main className="container py-8 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3 animate-fade-in-up">
          <Link href="/admin"><Button variant="ghost" size="sm">← חזרה</Button></Link>
          <h1 className="text-2xl font-serif font-semibold">ניהול משתמשים</h1>
        </div>

        <input
          className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="חיפוש לפי שם או אימייל..."
        />

        {usersQuery.isLoading && <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}

        <div className="space-y-2">
          {users.map((u: any) => (
            <div key={u.id} className="card-soft p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{u.name || "—"}</p>
                <p className="text-xs text-muted-foreground truncate">{u.email || u.openId}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${u.role === "admin" ? "bg-primary/10 text-primary border-primary/30" : u.role === "moderator" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-muted text-muted-foreground border-border"}`}>
                {u.role}
              </span>
              <div className="flex gap-1">
                {u.role !== "moderator" && u.role !== "admin" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs gap-1"
                    onClick={() => updateRole.mutate({ userId: u.id, role: "moderator" })}
                    disabled={updateRole.isPending}
                  >
                    <Shield className="w-3 h-3" />
                    מנחה
                  </Button>
                )}
                {u.role !== "admin" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs gap-1 border-destructive/30 text-destructive hover:bg-destructive/5"
                    onClick={() => { if (confirm("להשעות משתמש זה?")) suspendUser.mutate({ userId: u.id }); }}
                    disabled={suspendUser.isPending}
                  >
                    <UserX className="w-3 h-3" />
                    השעה
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
