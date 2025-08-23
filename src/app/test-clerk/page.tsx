"use client";

import { useSignUp } from "@clerk/nextjs";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function TestClerkPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const { signUp, isLoaded } = useSignUp();

  const testClerk = async () => {
    try {
      console.log("Clerk isLoaded:", isLoaded);
      console.log("SignUp object:", signUp);
      
      setDebugInfo({
        isLoaded,
        hasSignUp: !!signUp,
        signUpMethods: signUp ? Object.getOwnPropertyNames(signUp) : [],
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Clerk test error:", error);
      setDebugInfo({
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      });
    }
  };

  const testSignUp = async () => {
    try {
      if (!signUp) {
        setTestResult({ error: "SignUp not available" });
        return;
      }

      // Test a simple sign-up attempt
      const result = await signUp.create({
        emailAddress: "test@example.com",
        password: "SecurePassword123!",
      });

      setTestResult({
        status: result.status,
        createdUserId: result.createdUserId,
        createdSessionId: result.createdSessionId
      });
    } catch (error: any) {
      console.error("Test sign up error:", error);
      setTestResult({
        error: error.message,
        errors: error.errors,
        name: error.name
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Clerk Debug Test</CardTitle>
          <CardDescription>
            Test Clerk configuration and see debug info
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testClerk} className="w-full">
            Test Clerk Configuration
          </Button>
          
          <Button onClick={testSignUp} variant="outline" className="w-full">
            Test Sign Up Method
          </Button>
          
          {debugInfo && (
            <div className="bg-muted p-4 rounded-md">
              <h3 className="font-medium mb-2">Debug Info:</h3>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
          
          {testResult && (
            <div className="bg-muted p-4 rounded-md">
              <h3 className="font-medium mb-2">Test Result:</h3>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}
          
          <div className="text-sm text-muted-foreground">
            <p>Check the browser console for more detailed logs.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
