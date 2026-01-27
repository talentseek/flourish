import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = 'nodejs';

const VAPI_API_URL = "https://api.vapi.ai";

/**
 * DELETE /api/vapi/delete-assistant
 * 
 * Delete the Flourish Assistant and all its tools from Vapi
 * Requires admin access
 */
export async function DELETE(req: NextRequest) {
  try {
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

    const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID ||
      new URL(req.url).searchParams.get("assistantId") ||
      "768a8d5b-23ab-4990-84c3-ef57e68c96cd";

    // Step 1: Get assistant details to find tool IDs
    const getResponse = await fetch(`${VAPI_API_URL}/assistant/${assistantId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${VAPI_PRIVATE_KEY}`,
      },
    });

    if (!getResponse.ok) {
      const errorText = await getResponse.text();
      return NextResponse.json(
        { success: false, error: `Failed to fetch assistant: ${errorText}` },
        { status: getResponse.status }
      );
    }

    const assistant = await getResponse.json();
    const toolIds = assistant.model?.toolIds || [];

    // Step 2: Delete each tool
    const deletedTools: string[] = [];
    const toolErrors: Array<{ id: string; error: string }> = [];

    for (const toolId of toolIds) {
      try {
        const deleteToolResponse = await fetch(`${VAPI_API_URL}/tool/${toolId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${VAPI_PRIVATE_KEY}`,
          },
        });

        if (deleteToolResponse.ok) {
          deletedTools.push(toolId);
        } else {
          const errorText = await deleteToolResponse.text();
          toolErrors.push({ id: toolId, error: errorText });
        }
      } catch (error) {
        toolErrors.push({
          id: toolId,
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }

    // Step 3: Delete the assistant
    const deleteResponse = await fetch(`${VAPI_API_URL}/assistant/${assistantId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${VAPI_PRIVATE_KEY}`,
      },
    });

    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text();
      return NextResponse.json(
        {
          success: false,
          error: `Failed to delete assistant: ${errorText}`,
          toolsDeleted: deletedTools.length,
          toolErrors: toolErrors.length > 0 ? toolErrors : undefined,
        },
        { status: deleteResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Deleted assistant and ${deletedTools.length}/${toolIds.length} tools`,
      assistantId,
      toolsDeleted: deletedTools,
      toolErrors: toolErrors.length > 0 ? toolErrors : undefined,
    });
  } catch (error) {
    console.error("delete-assistant error", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal error",
      },
      { status: 500 }
    );
  }
}

