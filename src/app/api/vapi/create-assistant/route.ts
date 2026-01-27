import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
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
    // Validate Clerk authentication and admin role
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id }
    });

    if (!user || user.role !== "ADMIN") {
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

    // Get app URL from environment or use production domain
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_ENV === "production" ? "https://flourish-ai.vercel.app" : null) ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
      req.headers.get("origin") ||
      "https://flourish-ai.vercel.app";

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

    // Step 1: Create each tool separately via POST /tool
    console.log("Creating tools...");
    const toolIds: string[] = [];
    const addedFunctions: Array<{ name: string; id: string }> = [];
    const errors: Array<{ name: string; error: string; status: number; note?: string }> = [];

    for (const func of flourishAssistantFunctions) {
      const toolConfig = {
        type: "function" as const,
        function: {
          name: func.name,
          description: func.description,
          parameters: func.parameters,
        },
        server: {
          url: `${appUrl}/api/vapi/${func.name}`,
          // Add headers for authentication
          headers: {
            "Authorization": `Bearer ${VAPI_PRIVATE_KEY}`,
            "Content-Type": "application/json",
          },
        },
      };

      try {
        const toolResponse = await fetch(`${VAPI_API_URL}/tool`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${VAPI_PRIVATE_KEY}`,
          },
          body: JSON.stringify(toolConfig),
        });

        if (toolResponse.ok) {
          const createdTool = await toolResponse.json();
          toolIds.push(createdTool.id);
          addedFunctions.push({ name: func.name, id: createdTool.id });
          console.log(`✅ Created tool: ${func.name} (ID: ${createdTool.id})`);
        } else {
          const errorText = await toolResponse.text();
          errors.push({
            name: func.name,
            error: errorText,
            status: toolResponse.status,
            note: "Tool may need to be created manually via Vapi dashboard",
          });
          console.error(`❌ Failed to create tool ${func.name}:`, errorText);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        errors.push({
          name: func.name,
          error: errorMessage,
          status: 0,
          note: "Network or unexpected error",
        });
        console.error(`❌ Error creating tool ${func.name}:`, error);
      }
    }

    // Step 2: Update assistant with toolIds if we successfully created any tools
    if (toolIds.length > 0) {
      console.log(`Updating assistant with ${toolIds.length} tool IDs...`);
      const updateResponse = await fetch(`${VAPI_API_URL}/assistant/${assistantId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${VAPI_PRIVATE_KEY}`,
        },
        body: JSON.stringify({
          model: {
            ...assistantConfig.model,
            toolIds: toolIds,
          },
        }),
      });

      if (updateResponse.ok) {
        const updatedAssistant = await updateResponse.json();
        console.log(`✅ Successfully updated assistant with ${toolIds.length} tools`);
      } else {
        const errorText = await updateResponse.text();
        console.error("❌ Failed to update assistant with toolIds:", errorText);
        errors.push({
          name: "Update Assistant",
          error: errorText,
          status: updateResponse.status,
          note: "Tools were created but not linked to assistant. You may need to link them manually via Vapi dashboard.",
        });
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

