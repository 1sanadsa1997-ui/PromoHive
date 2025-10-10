import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function Register() {
  const { register, loading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(email, password, name);
    } catch (err) {
      // handled by toast
    }
  };

  return (
    <div className="container py-20">
      <div className="mx-auto max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-muted-foreground">Full name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-md border px-3 py-2" placeholder="Jane Doe" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-muted-foreground">Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-md border px-3 py-2" placeholder="you@company.com" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-muted-foreground">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-md border px-3 py-2" placeholder="Strong password" />
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Already have an account? <Link to="/login" className="text-primary">Sign in</Link></div>
                <div className="flex gap-2">
                  <Button variant="ghost" asChild>
                    <Link to="/">Back</Link>
                  </Button>
                  <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create account'}</Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
