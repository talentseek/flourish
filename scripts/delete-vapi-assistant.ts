/**
 * Script to delete the Flourish Assistant and all its tools from Vapi
 * 
 * Run with: pnpm tsx scripts/delete-vapi-assistant.ts
 * 
 * Requires:
 * - VAPI_PRIVATE_KEY environment variable
 * - ASSISTANT_ID environment variable (optional, will list all if not provided)
 */

import dotenv from "dotenv";

dotenv.config();

const VAPI_API_URL = "https://api.vapi.ai";
const VAPI_PRIVATE_KEY = process.env.VAPI_PRIVATE_KEY || "3a4cda78-0d09-4a50-8833-0a6b211dde80";
const ASSISTANT_ID = process.env.ASSISTANT_ID || process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "768a8d5b-23ab-4990-84c3-ef57e68c96cd";

async function deleteVapiAssistant() {
  console.log("🗑️  Deleting Flourish Assistant from Vapi...");
  console.log(`🔑 Using Vapi Private Key: ${VAPI_PRIVATE_KEY.substring(0, 10)}...`);

  try {
    // Step 1: Get assistant details to find tool IDs
    console.log(`\n📋 Fetching assistant details: ${ASSISTANT_ID}`);
    const getResponse = await fetch(`${VAPI_API_URL}/assistant/${ASSISTANT_ID}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${VAPI_PRIVATE_KEY}`,
      },
    });

    if (!getResponse.ok) {
      const errorText = await getResponse.text();
      console.error("❌ Failed to fetch assistant:", errorText);
      console.log("\n💡 Tip: The assistant might already be deleted or the ID is incorrect.");
      return;
    }

    const assistant = await getResponse.json();
    console.log(`✅ Found assistant: ${assistant.name}`);
    
    // Step 2: Get tools associated with this assistant
    const toolIds = assistant.model?.toolIds || [];
    console.log(`\n🔧 Found ${toolIds.length} tools associated with assistant`);

    // Step 3: Delete each tool
    if (toolIds.length > 0) {
      console.log("\n🗑️  Deleting tools...");
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
            console.log(`   ✅ Deleted tool: ${toolId}`);
          } else {
            const errorText = await deleteToolResponse.text();
            console.error(`   ❌ Failed to delete tool ${toolId}: ${errorText}`);
          }
        } catch (error) {
          console.error(`   ❌ Error deleting tool ${toolId}:`, error);
        }
      }
    }

    // Step 4: Delete the assistant
    console.log(`\n🗑️  Deleting assistant: ${ASSISTANT_ID}`);
    const deleteResponse = await fetch(`${VAPI_API_URL}/assistant/${ASSISTANT_ID}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${VAPI_PRIVATE_KEY}`,
      },
    });

    if (deleteResponse.ok) {
      console.log("✅ Successfully deleted assistant and all tools!");
    } else {
      const errorText = await deleteResponse.text();
      console.error("❌ Failed to delete assistant:", errorText);
    }

  } catch (error) {
    console.error("❌ Error deleting assistant:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Stack:", error.stack);
    }
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  deleteVapiAssistant()
    .then(() => {
      console.log("\n✨ Done!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Fatal error:", error);
      process.exit(1);
    });
}

export { deleteVapiAssistant };

