import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboardPage() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Active Listings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">84</p>
          <p className="text-sm text-muted-foreground">Awaiting approvals: 6</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Bookings Today</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">32</p>
          <p className="text-sm text-muted-foreground">Conversion rate up 12%</p>
        </CardContent>
      </Card>
    </div>
  );
}
