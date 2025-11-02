import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { flourishAssistantFunctions } from "@/lib/vapi-functions";

export const runtime = 'nodejs';

const VAPI_API_URL = "https://api.vapi.ai";

/**
 * POST /api/vapi/create-assistant
 * 
 * Create the Flourish Assistant in Vapi programmatically
 * Requires admin access
 */
export async function POST(req: NextRequest) {
  try {
    // Validate Clerk authentication and admin role
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    const VAPI_PRIVATE_KEY = process.env.VAPI_PRIVATE_KEY;
    if (!VAPI_PRIVATE_KEY) {
      return NextResponse.json(
        { success: false, error: "VAPI_PRIVATE_KEY not configured" },
        { status: 500 }
      );
    }

    // Get app URL from environment or request
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` :
      req.headers.get("origin") || "https://your-app-url.com";

    // Assistant configuration (create assistant first, then add functions separately)
    const assistantConfig = {
      name: "Flourish Assistant",
      firstMessage: "Hello! I'm your Flourish Assistant. I can help you analyze shopping centres, compare tenant mixes, and provide recommendations to improve footfall and sales. What would you like to know?",
      model: {
        provider: "openai",
        model: "gpt-4",
        temperature: 0.7,
        maxTokens: 300,
      },
      voice: {
        provider: "11labs",
        voiceId: "21m00Tcm4TlvDq8ikWAM", // Default 11labs voice (Rachel)
        stability: 0.5,
        similarityBoost: 0.75,
      },
      language: "en",
    };

    // Create assistant via Vapi API (without functions first)
    const createResponse = await fetch(`${VAPI_API_URL}/assistant`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${VAPI_PRIVATE_KEY}`,
      },
      body: JSON.stringify(assistantConfig),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error("Vapi API error creating assistant:", errorText);
      return NextResponse.json(
        {
          success: false,
          error: `Vapi API error: ${createResponse.status} ${createResponse.statusText}`,
          details: errorText,
        },
        { status: createResponse.status }
      );
    }

    const assistant = await createResponse.json();
    const assistantId = assistant.id;

    // Build all server functions configuration
    const serverFunctions = flourishAssistantFunctions.map((func) => ({
      type: "function",
      function: {
        name: func.name,
        description: func.description,
        parameters: func.parameters,
      },
      serverUrl: `${appUrl}/api/vapi/${func.name}`,
    }));

    // Try to update assistant with all functions at once via PATCH
    const updateResponse = await fetch(`${VAPI_API_URL}/assistant/${assistantId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${VAPI_PRIVATE_KEY}`,
      },
      body: JSON.stringify({
        serverFunctions: serverFunctions,
      }),
    });

    let addedFunctions = [];
    let errors = [];

    if (updateResponse.ok) {
      const updatedAssistant = await updateResponse.json();
      addedFunctions = serverFunctions.map((f) => ({ name: f.function.name, method: "PATCH" }));
      console.log(`Successfully added ${serverFunctions.length} functions via PATCH`);
    } else {
      const errorText = await updateResponse.text();
      console.error("Failed to add functions via PATCH:", errorText);
      
      // Fallback: Try adding functions one by one via different endpoints
      for (const func of flourishAssistantFunctions) {
        const functionConfig = {
          type: "function",
          function: {
            name: func.name,
            description: func.description,
            parameters: func.parameters,
          },
          serverUrl: `${appUrl}/api/vapi/${func.name}`,
        };

        // Try POST /server-function
        let functionResponse = await fetch(`${VAPI_API_URL}/server-function`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${VAPI_PRIVATE_KEY}`,
          },
          body: JSON.stringify({
            ...functionConfig,
            assistantId: assistantId,
          }),
        });

        if (functionResponse.ok) {
          const addedFunction = await functionResponse.json();
          addedFunctions.push({ name: func.name, id: addedFunction.id });
        } else {
          const funcErrorText = await functionResponse.text();
          errors.push({ 
            name: func.name, 
            error: funcErrorText, 
            status: functionResponse.status,
            note: "Functions may need to be added manually via Vapi dashboard"
          });
          console.error(`Failed to add function ${func.name}:`, funcErrorText);
        }
      }
    }

    return NextResponse.json({
      success: true,
      assistant,
      functions: {
        added: addedFunctions,
        errors: errors.length > 0 ? errors : undefined,
      },
      message: `Flourish Assistant created successfully. ${addedFunctions.length}/${flourishAssistantFunctions.length} functions added.`,
    });
  } catch (error) {
    console.error("create-assistant error", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal error",
      },
      { status: 500 }
    );
  }
}

