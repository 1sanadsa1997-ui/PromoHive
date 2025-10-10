import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const dummy = new Array(6).fill(0).map((_, i) => ({ id: i + 1, title: `Task example #${i + 1}`, reward: `$${(i + 1) * 2}.00` }));

export default function Tasks() {
  return (
    <div className="container py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Available tasks</h1>
        <Button asChild>
          <Link to="/tasks/create">Create task</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {dummy.map((t) => (
          <Card key={t.id}>
            <CardHeader>
              <CardTitle className="text-lg">{t.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-3 text-sm text-muted-foreground">Reward: {t.reward}</div>
              <div className="flex justify-between">
                <Button size="sm" asChild>
                  <Link to={`/tasks/${t.id}`}>View</Link>
                </Button>
                <Button size="sm" variant="ghost">Bookmark</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
