import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  return (
    <div className="container py-20">
      <div className="mx-auto max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Reset your password</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Enter your email and we'll send a secure reset link.</p>
            <form className="mt-4 space-y-4">
              <input className="w-full rounded-md border px-3 py-2" placeholder="you@company.com" />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" asChild>
                  <Link to="/login">Back</Link>
                </Button>
                <Button>Send reset link</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
