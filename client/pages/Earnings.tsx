import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Earnings() {
  const transactions = [
    { id: 1, type: "Task Reward", amount: 8.0, date: "2025-09-01" },
    { id: 2, type: "Withdrawal", amount: -50.0, date: "2025-08-28" },
    { id: 3, type: "Referral Bonus", amount: 5.0, date: "2025-08-20" },
  ];

  return (
    <div className="container py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Earnings</h1>
          <p className="text-sm text-muted-foreground">Manage balances, withdrawals, and transaction history.</p>
        </div>
        <div className="flex gap-2">
          <Button>Request withdrawal</Button>
          <Button variant="ghost">Payout methods</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Available balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$1,240.00</div>
            <div className="mt-2 text-sm text-muted-foreground">Pending: $120.00 • Withdrawable after approval</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Monthly earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">$1,820.00</div>
            <div className="mt-2 text-sm text-muted-foreground">Includes bonuses and referrals</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Earnings goal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">$500.00 / $2,000.00</div>
            <div className="mt-2 text-sm text-muted-foreground">Progress towards your target payout</div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold">Recent transactions</h2>
        <div className="mt-4 space-y-3">
          {transactions.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-md border p-3">
              <div>
                <div className="font-medium">{t.type}</div>
                <div className="text-sm text-muted-foreground">{t.date}</div>
              </div>
              <div className={t.amount > 0 ? "font-semibold text-emerald-600" : "font-semibold text-rose-600"}>
                {t.amount > 0 ? `+$${t.amount.toFixed(2)}` : `-$${Math.abs(t.amount).toFixed(2)}`}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
