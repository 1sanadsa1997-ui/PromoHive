import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Help() {
  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold">Help Center</h1>
      <p className="text-sm text-muted-foreground">FAQ, support tickets, and contact information.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>FAQ</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Common questions and guides.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Contact Support</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Open a ticket or chat with our support team.</p>
            <div className="mt-4">
              <Button>Open ticket</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
