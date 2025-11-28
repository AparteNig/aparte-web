import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HostDashboardPage() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Check-ins</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">5</p>
          <p className="text-sm text-muted-foreground">Next guest arrives in 2 hours.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Monthly Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">₦1.2m</p>
          <p className="text-sm text-muted-foreground">Projected revenue this month.</p>
        </CardContent>
      </Card>
    </div>
  );
}
