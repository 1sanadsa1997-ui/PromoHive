import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Notifications() {
  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold">Notifications</h1>
      <p className="text-sm text-muted-foreground">In-app notifications and templates (placeholder).</p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>Welcome email sent</li>
              <li>Payout processed</li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Email/SMS templates and scheduling UI will be here.</p>
            <div className="mt-4">
              <Button>Manage templates</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
