"use client";

import { useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = () => {
    signOut({
      redirectUrl: "/"
    });
  };

  return (
    <Button onClick={handleSignOut}>
      Sign Out
    </Button>
  );
}
