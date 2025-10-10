import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams, Link } from "react-router-dom";

export default function TaskComplete() {
  const { id } = useParams();
  return (
    <div className="container py-10">
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Complete Task #{id}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">This wizard guides users through verification steps. (Placeholder UI)</p>
            <div className="mt-4 space-y-4">
              <div className="rounded-md border p-4">
                <div className="font-medium">Step 1 — Provide proof</div>
                <div className="text-sm text-muted-foreground">Upload image or paste link.</div>
              </div>
              <div className="rounded-md border p-4">
                <div className="font-medium">Step 2 — Confirm details</div>
                <div className="text-sm text-muted-foreground">Answer required questions and submit.</div>
              </div>
              <div className="flex justify-end">
                <Button asChild>
                  <Link to="/tasks">Submit</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
