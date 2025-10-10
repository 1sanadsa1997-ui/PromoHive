import { Link, NavLink, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  // Use the provided PromoHive logo image (remote asset)
  const src = "https://cdn.builder.io/api/v1/image/assets%2F21bbd87a61d84a769d5bddb832fe0880%2F95c64570ef734cfb90b37f60653828af?format=webp&width=800";
  return (
    <img
      src={src}
      alt="PromoHive logo"
      className={cn("object-contain", className)}
      loading="lazy"
      width={28}
      height={28}
    />
  );
}

function Header() {
  const navLink = ({ isActive }: { isActive: boolean }) =>
    cn(
      "px-3 py-2 text-sm font-medium transition-colors",
      isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
    );

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <LogoMark />
          <span className="text-xl font-extrabold tracking-tight">PromoHive</span>
        </Link>
        <nav className="hidden gap-1 md:flex">
          <NavLink to="/" className={navLink} end>
            Home
          </NavLink>
          <a href="#features" className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
            Features
          </a>
          <a href="#levels" className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
            Levels
          </a>
          <NavLink to="/dashboard" className={navLink}>
            Dashboard
          </NavLink>
        </nav>
        <div className="flex items-center gap-2">
          {/* Show user if logged in */}
          {(() => {
            try {
              const auth = useAuth();
              if (auth.user) {
                return (
                  <div className="flex items-center gap-3">
                    <div className="hidden md:flex flex-col text-right">
                      <div className="text-sm font-medium">{auth.user.name || auth.user.email}</div>
                      <div className="text-xs text-muted-foreground">{auth.user.role || 'User'}</div>
                    </div>
                    <Button variant="ghost" onClick={() => auth.logout()}>Sign out</Button>
                  </div>
                );
              }
            } catch (e) {
              /* ignore hook during SSR */
            }
            return (
              <>
                <Button variant="ghost" className="hidden md:inline-flex" asChild>
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Get started</Link>
                </Button>
              </>
            );
          })()}
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-10 grid gap-6 md:grid-cols-3">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <LogoMark className="h-6 w-6" />
            <span className="font-bold">PromoHive Global Promo Network</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-sm">
            A complete task completion and reward platform built for scale, security, and growth.
          </p>
        </div>
        <div className="space-y-2 text-sm">
          <div className="font-semibold">Platform</div>
          <ul className="space-y-1 text-muted-foreground">
            <li><a href="#security" className="hover:text-foreground">Security</a></li>
            <li><a href="#features" className="hover:text-foreground">Features</a></li>
            <li><a href="#levels" className="hover:text-foreground">Levels</a></li>
          </ul>
        </div>
        <div className="space-y-2 text-sm">
          <div className="font-semibold">Company</div>
          <ul className="space-y-1 text-muted-foreground">
            <li><a href="#" className="hover:text-foreground">Terms</a></li>
            <li><a href="#" className="hover:text-foreground">Privacy</a></li>
            <li><a href="#" className="hover:text-foreground">Status</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} PromoHive. All rights reserved.
      </div>
    </footer>
  );
}

export default function AppLayout() {
  return (
    <div className="min-h-dvh flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
