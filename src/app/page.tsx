import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted px-6">
      <main className="max-w-3xl space-y-8 text-center">
        <p className="text-sm uppercase tracking-widest text-primary">Aparte Console</p>
        <h1 className="text-4xl font-semibold leading-tight">
          Operations + Host toolkits to run the Nigerian stay marketplace.
        </h1>
        <p className="text-muted-foreground">
          Use the admin console to moderate supply, monitor bookings, and support guests.
          Landlords use the host workspace to manage listings, calendars, payouts, and chats.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button asChild className="flex-1 sm:flex-none">
            <Link href="/admin/login">Admin Console</Link>
          </Button>
          <Button asChild variant="secondary" className="flex-1 sm:flex-none">
            <Link href="/host/login">Host Workspace</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
