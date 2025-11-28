import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HostMessagesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Host Messages</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Conversation threads will appear here.</p>
      </CardContent>
    </Card>
  );
}
