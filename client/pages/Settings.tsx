import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Settings() {
  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="text-sm text-muted-foreground">Account and privacy settings placeholder.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Name, email, phone, and preferences.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">2FA, sessions, and password management.</p>
            <div className="mt-4">
              <Button>Manage security</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
