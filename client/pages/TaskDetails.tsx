import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams, Link } from "react-router-dom";

export default function TaskDetails() {
  const { id } = useParams();
  return (
    <div className="container py-10">
      <div className="flex items-start gap-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Task #{id}</h1>
          <p className="mt-2 text-muted-foreground">This is a placeholder for a detailed task description, verification requirements, and attachments.</p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Verification</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Supported modes: text, URL, image, video, survey, location, social verification.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Reward</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold">$8.00</div>
                <p className="text-sm text-muted-foreground">Estimated completion time: 10-15 minutes</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 flex gap-3">
            <Button asChild>
              <Link to={`/complete/${id}`}>Start task</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/tasks">Back</Link>
            </Button>
          </div>
        </div>
        <aside className="w-80">
          <Card>
            <CardContent>
              <div className="text-sm text-muted-foreground">Task metadata, restrictions, and publisher info will appear here.</div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
