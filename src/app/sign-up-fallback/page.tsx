import { SignUp } from "@clerk/nextjs";

export default function SignUpFallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <SignUp 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-none",
          },
        }}
      />
    </div>
  );
}
