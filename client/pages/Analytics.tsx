import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Analytics() {
  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold">Analytics & Reporting</h1>
      <p className="text-sm text-muted-foreground">Placeholder dashboards and charts for user and business metrics.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>User metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-40 w-full bg-gradient-to-br from-slate-50 to-slate-100 rounded" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-40 w-full bg-gradient-to-br from-amber-50 to-amber-100 rounded" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tasks performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-40 w-full bg-gradient-to-br from-emerald-50 to-emerald-100 rounded" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
