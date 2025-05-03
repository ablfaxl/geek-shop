"use client";

import { SessionProvider as SProvider } from "next-auth/react";
export default function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SProvider>{children}</SProvider>;
}
