// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string;
      email?: string;
      isAdmin: boolean;
    };
  }

  interface User {
    id: string;
    isAdmin: boolean;
  }
}

declare module "@auth/core/adapters" {
  interface AdapterUser {
    id: string;
    isAdmin: boolean;
  }
}
