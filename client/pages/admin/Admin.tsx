import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/adminApi";
import { useAdmin } from "@/hooks/useAdmin";

export default function Admin() {
  const { isAuthenticated, login, logout } = useAdmin();
  const qc = useQueryClient();
  const [pwInput, setPwInput] = useState("");

  const { data: pendingUsers, isLoading: loadingUsers } = useQuery(["admin", "pendingUsers"], () => adminFetch("/api/admin/users/pending"), { enabled: isAuthenticated });
  const { data: withdrawals, isLoading: loadingWithdrawals } = useQuery(["admin", "withdrawals"], () => adminFetch("/api/admin/withdrawals"), { enabled: isAuthenticated });
  const { data: rules, isLoading: loadingRules } = useQuery(["admin", "rules"], () => adminFetch("/api/admin/rules"), { enabled: isAuthenticated });

  const approveUser = useMutation((id: number | string) => adminFetch(`/api/admin/users/${id}/approve`, { method: "POST" }), {
    onSuccess() { qc.invalidateQueries(["admin", "pendingUsers"]); }
  });

  const rejectUser = useMutation((payload: { id: number | string; reason?: string }) => adminFetch(`/api/admin/users/${payload.id}/reject`, { method: "POST", body: { reason: payload.reason } }), {
    onSuccess() { qc.invalidateQueries(["admin", "pendingUsers"]); }
  });

  const approveWithdrawal = useMutation((id: number | string) => adminFetch(`/api/admin/withdrawals/${id}/approve`, { method: "POST" }), {
    onSuccess() { qc.invalidateQueries(["admin", "withdrawals"]); }
  });

  const saveRules = useMutation((payload: any) => adminFetch(`/api/admin/rules`, { method: "POST", body: payload }), {
    onSuccess() { qc.invalidateQueries(["admin", "rules"]); }
  });

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    try {
      login(pwInput);
      // try a test call to ensure credentials are valid
      await adminFetch("/api/admin/admins");
      setPwInput("");
    } catch (err: any) {
      // invalid - clear and show alert
      logout();
      alert(err?.message || "Invalid admin password");
    }
  }

  return (
    <div className="container py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/analytics">Analytics</Link>
          </Button>
        </div>
      </div>

      {!isAuthenticated && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Admin sign in</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="flex gap-2 max-w-md">
              <input value={pwInput} onChange={(e) => setPwInput(e.target.value)} className="input" placeholder="Admin password" />
              <Button type="submit">Sign in</Button>
            </form>
            <div className="mt-3 text-sm text-muted-foreground">Admin endpoints require the server ADMIN_PASSWORD. Signing in stores the password in session only.</div>
          </CardContent>
        </Card>
      )}

      {isAuthenticated && (
        <div>
          <div className="mb-4 flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => { logout(); qc.clear(); }}>Sign out</Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Approval queue</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Review and bulk-approve new users.</p>
                <div className="mt-4 space-y-3">
                  {loadingUsers && <div>Loading...</div>}
                  {!loadingUsers && (!pendingUsers || pendingUsers.length === 0) && <div className="text-sm text-muted-foreground">No pending users</div>}
                  {pendingUsers && pendingUsers.map((u: any) => (
                    <div key={u.id} className="flex items-center justify-between rounded-md border p-3">
                      <div>
                        <div className="font-medium">{u.name || u.email}</div>
                        <div className="text-sm text-muted-foreground">{u.email} • {u.reason || 'N/A'}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => approveUser.mutate(u.id)} disabled={approveUser.isLoading}>Approve</Button>
                        <Button size="sm" variant="ghost" onClick={() => {
                          const reason = window.prompt("Rejection reason (optional)");
                          rejectUser.mutate({ id: u.id, reason });
                        }}>Reject</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Withdrawals</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Review and process withdrawal requests.</p>
                <div className="mt-4 space-y-3">
                  {loadingWithdrawals && <div>Loading...</div>}
                  {!loadingWithdrawals && (!withdrawals || withdrawals.length === 0) && <div className="text-sm text-muted-foreground">No withdrawal requests</div>}
                  {withdrawals && withdrawals.map((w: any) => (
                    <div key={w.id} className="flex items-center justify-between rounded-md border p-3">
                      <div>
                        <div className="font-medium">{w.user || w.email || 'Unknown'}</div>
                        <div className="text-sm text-muted-foreground">Request #{w.id}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-semibold">${w.amount}</div>
                        <div className="text-sm text-muted-foreground">{w.status}</div>
                        <Button size="sm" onClick={() => approveWithdrawal.mutate(w.id)} disabled={approveWithdrawal.isLoading}>Approve</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Task moderation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Monitor task performance, set auto-approval rules, and handle disputes.</p>
                <div className="mt-4">
                  <Button asChild>
                    <Link to="/tasks">Open tasks</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Financial summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">Total payouts: $1,240,000</div>
                <div className="mt-2 text-sm text-muted-foreground">Processed this year • Audit logs available</div>
                <div className="mt-4 flex gap-2">
                  <Button>Export CSV</Button>
                  <Button variant="ghost">Open audit</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Configure auto-approval rules, pricing tiers, and withdrawal limits.</p>
                <div className="mt-4 space-y-3">
                  {loadingRules && <div>Loading rules...</div>}
                  {!loadingRules && rules && (
                    <div>
                      <pre className="max-h-64 overflow-auto rounded-md border bg-muted p-3 text-xs">{JSON.stringify(rules, null, 2)}</pre>
                      <div className="mt-3 flex gap-2">
                        <Button onClick={() => {
                          const edited = window.prompt("Edit rules (JSON)", JSON.stringify(rules, null, 2));
                          if (!edited) return;
                          try {
                            const parsed = JSON.parse(edited);
                            saveRules.mutate(parsed);
                          } catch (err: any) {
                            alert("Invalid JSON");
                          }
                        }}>Edit rules</Button>
                        <Button variant="ghost" onClick={() => qc.invalidateQueries(["admin", "rules"])}>Refresh</Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
