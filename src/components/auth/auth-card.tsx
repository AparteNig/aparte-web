 "use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setAuthCookie } from "@/lib/auth";

type AuthCardProps = {
  title: string;
  description: string;
  actionLabel: string;
  successHref: string;
  cookieName: string;
  redirectLabel: string;
  redirectHref: string;
};

export const AuthCard = ({
  title,
  description,
  actionLabel,
  successHref,
  cookieName,
  redirectLabel,
  redirectHref
}: AuthCardProps) => {
  const router = useRouter();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthCookie(cookieName, `${cookieName}-${Date.now()}`);
    router.push(successHref);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input placeholder="Email address" type="email" required />
            <Input placeholder="Password" type="password" required />
          </div>
          <Button className="w-full" type="submit">
            {actionLabel}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          {redirectLabel}{" "}
          <Link href={redirectHref} className="font-semibold text-primary">
            Go
          </Link>
        </p>
      </CardContent>
    </Card>
  );
};
