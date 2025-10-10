import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import FuturisticStats from "@/components/visuals/FuturisticStats";

function GradientBG() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute -top-40 left-1/2 h-[600px] w-[1200px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,theme(colors.primary.DEFAULT)_0%,transparent_60%)] opacity-[0.15]" />
      <div className="absolute -bottom-40 left-1/3 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,theme(colors.accent.DEFAULT)_0%,transparent_60%)] opacity-[0.08]" />
    </div>
  );
}

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative">
        <GradientBG />
        <div className="container flex flex-col items-center gap-6 py-16 text-center md:py-24">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">
            <span className="inline-block h-2 w-2 rounded-full bg-primary" />
            Enterprise task & reward platform
          </div>

          <div className="w-40 h-40 md:w-64 md:h-64 mx-auto">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F21bbd87a61d84a769d5bddb832fe0880%2F95c64570ef734cfb90b37f60653828af?format=webp&width=800"
              alt="PromoHive logo"
              className="w-full h-full object-contain rounded-md shadow-2xl"
              loading="eager"
            />
          </div>

          {/* Interactive monochrome animated chart */}
          <div className="w-full flex justify-center">
            <div className="w-full max-w-2xl">
              {/* Lazy-load the visual to avoid heavy rendering on mobile */}
              <React.Suspense fallback={<div className="h-6" />}>
                {/* AnimatedChart component loaded inline to keep bundle simple */}
                <div data-component="futuristic-stats" className="mt-6">
                  <FuturisticStats />
                </div>
              </React.Suspense>
            </div>
          </div>

          <h1 className="max-w-4xl text-balance bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-4xl font-extrabold leading-tight text-transparent md:text-6xl">
            PromoHive Global Promo Network
          </h1>
          <p className="max-w-2xl text-pretty text-muted-foreground md:text-lg">
            Launch, verify, and reward promotional tasks at global scale. Secure, compliant, and built for growth.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link to="/dashboard">Get started</Link>
            </Button>
            <Button size="lg" variant="ghost" asChild>
              <a href="#features">Explore features</a>
            </Button>
          </div>
          <div className="mt-8 grid w-full max-w-4xl grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { label: "Avg. approval", value: "98%" },
              { label: "Monthly tasks", value: "250k+" },
              { label: "Payouts processed", value: "$12M" },
              { label: "Uptime", value: "99.9%" },
            ].map((s) => (
              <Card key={s.label}>
                <CardContent className="p-4 text-left">
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                  <div className="text-xl font-semibold">{s.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container py-16 md:py-24">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Everything you need to run promos</h2>
          <p className="text-muted-foreground">Authentication, verification, rewards, analytics, and admin control — integrated end‑to‑end.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              t: "Authentication & Security",
              d: "Email, OAuth, 2FA, device history, and role-based access with enterprise hardening.",
            },
            {
              t: "Task Engine",
              d: "Rich tasks with text, URL, image, video, survey, location, and social verification modes.",
            },
            {
              t: "Verification Workflow",
              d: "Step-by-step wizards, real-time validation, peer review, and quality scoring.",
            },
            {
              t: "Rewards & Payouts",
              d: "Multi-currency balances, withdrawal requests, and audit-ready transaction history.",
            },
            {
              t: "Dashboards & Analytics",
              d: "Personalized insights, recommendations, and executive reporting with charts.",
            },
            {
              t: "Notifications",
              d: "In-app, email, and SMS with templates, schedules, and user preferences.",
            },
          ].map((f) => (
            <Card key={f.t} className="relative">
              <CardHeader>
                <CardTitle className="text-lg">{f.t}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{f.d}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Levels */}
      <section id="levels" className="bg-muted/30 py-16 md:py-24">
        <div className="container">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Level up and unlock more rewards</h2>
            <p className="text-muted-foreground">Progress through levels to increase reward limits and benefits.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { lvl: 1, reward: "$70 rewards", note: "Unlimited tasks" },
              { lvl: 2, reward: "$130 rewards", note: "Premium features" },
              { lvl: 3, reward: "$180 rewards", note: "VIP benefits" },
            ].map((l, i) => (
              <Card key={l.lvl} className={i === 0 ? "border-primary shadow-md" : ""}>
                <CardHeader>
                  <CardTitle className="text-lg">Level {l.lvl}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{l.reward}</div>
                  <p className="text-sm text-muted-foreground">{l.note}</p>
                  <Button className="mt-4 w-full" asChild>
                    <Link to="/dashboard">Upgrade</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="container py-16 md:py-24">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Security & Compliance</h2>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>• MFA, RBAC, rate limiting, and hardened headers</li>
              <li>• XSS/CSRF protection and input validation</li>
              <li>• GDPR tooling, data retention, and audit trails</li>
              <li>• Performance budgets, monitoring, and alerts</li>
            </ul>
            <div className="mt-6 flex gap-3">
              <Button asChild>
                <Link to="/dashboard">Open dashboard</Link>
              </Button>
              <Button variant="outline" asChild>
                <a href="#features">View features</a>
              </Button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {["Tasks", "Payouts", "Reviews", "Analytics"].map((k) => (
              <Card key={k}>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold">{k}</div>
                  <p className="text-sm text-muted-foreground">Enterprise-grade modules designed for reliability.</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
