// app/dashboard/page.tsx
"use client";

import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { User, UsersTable } from "./components/users-table";
export default function Dashboard() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (session?.user?.isAdmin) {
      fetch("/api/users")
        .then((res) => res.json())
        .then((data) => setUsers(data));
    }
  }, [session]);

  if (!session?.user?.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold">Access Denied</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session.user.name}
          </p>
        </div>
        <Button
          onClick={() => signOut({ callbackUrl: "/auth" })}
          variant="outline"
        >
          Sign Out
        </Button>
      </div>

      <div className="rounded-lg border p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">User Management</h2>
        <UsersTable data={users} />
      </div>
    </div>
  );
}
