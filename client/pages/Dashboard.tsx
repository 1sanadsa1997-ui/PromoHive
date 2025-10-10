import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  return (
    <div className="container py-10">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your tasks, earnings, and achievements.</p>
        </div>
        <div className="flex gap-2">
          <Button>Create task</Button>
          <Button variant="secondary">Withdraw</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$1,240.00</div>
            <p className="text-xs text-muted-foreground">+18% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Tasks completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">342</div>
            <p className="text-xs text-muted-foreground">This year</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Approval rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">98.4%</div>
            <p className="text-xs text-muted-foreground">Peer-reviewed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">Level 1</div>
            <p className="text-xs text-muted-foreground">$70 max rewards unlocked</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>In-progress tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center justify-between rounded-md border p-3">
                <span>Share product launch on LinkedIn</span>
                <Button size="sm">Continue</Button>
              </li>
              <li className="flex items-center justify-between rounded-md border p-3">
                <span>Upload store display photo</span>
                <Button size="sm" variant="secondary">Continue</Button>
              </li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span>Task reward</span>
                <span className="font-medium text-emerald-600">+$8.00</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Withdrawal</span>
                <span className="font-medium text-rose-600">-$50.00</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
