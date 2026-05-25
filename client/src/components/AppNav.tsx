import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link, useLocation } from "wouter";
import {
  Heart,
  MessageCircle,
  Compass,
  Sparkles,
  Shield,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

const NAV_ITEMS = [
  { href: "/picks", label: "Daily Picks", icon: Heart },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/inbox", label: "Inbox", icon: MessageCircle },
  { href: "/skills", label: "Skills", icon: Sparkles },
  { href: "/safety-center", label: "Safety", icon: Shield },
];

export function AppNav() {
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const logoutMutation = trpc.auth.logout.useMutation({ onSuccess: logout });

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link href={isAuthenticated ? "/home" : "/"}>
          <span className="font-serif text-2xl text-primary font-semibold cursor-pointer select-none">
            קשר
          </span>
        </Link>

        {/* Desktop nav */}
        {isAuthenticated && (
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`gap-2 ${location === href ? "text-primary bg-primary/8" : "text-muted-foreground"}`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Button>
              </Link>
            ))}
          </nav>
        )}

        {/* Right side */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              {/* Mod/Admin quick links */}
              {(user?.role === "moderator" || user?.role === "admin") && (
                <Link href="/mod/queue">
                  <Button variant="outline" size="sm" className="hidden md:flex gap-2 text-xs">
                    <Shield className="w-3.5 h-3.5" />
                    Mod Queue
                  </Button>
                </Link>
              )}
              {user?.role === "admin" && (
                <Link href="/admin">
                  <Button variant="outline" size="sm" className="hidden md:flex gap-2 text-xs">
                    Admin
                  </Button>
                </Link>
              )}

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile/edit" className="cursor-pointer">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/trust" className="cursor-pointer">AI Trust Hub</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive cursor-pointer"
                    onClick={() => logoutMutation.mutate()}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile menu toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </>
          ) : (
            <Button asChild size="sm" className="bg-primary text-primary-foreground">
              <a href={getLoginUrl()}>Sign in</a>
            </Button>
          )}
        </div>
      </div>

      {/* Mobile nav drawer */}
      {isAuthenticated && mobileOpen && (
        <div className="md:hidden border-t border-border bg-background animate-fade-in-up">
          <nav className="container py-3 flex flex-col gap-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} onClick={() => setMobileOpen(false)}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start gap-3 ${location === href ? "text-primary bg-primary/8" : ""}`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Button>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
