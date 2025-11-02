/**
 * Script to create the Flourish Assistant in Vapi using their API
 * 
 * Run with: pnpm tsx scripts/create-vapi-assistant.ts
 * 
 * Requires:
 * - VAPI_PRIVATE_KEY environment variable
 * - NEXT_PUBLIC_APP_URL environment variable (your deployed app URL)
 */

import { flourishAssistantFunctions } from "../src/lib/vapi-functions";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const VAPI_API_URL = "https://api.vapi.ai";
const VAPI_PRIVATE_KEY = process.env.VAPI_PRIVATE_KEY || "3a4cda78-0d09-4a50-8833-0a6b211dde80";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
  "https://your-app-url.com";

// ServerFunction type is now inline in the mapping

/**
 * Create the Flourish Assistant in Vapi
 */
async function createVapiAssistant() {
  console.log("🚀 Creating Flourish Assistant in Vapi...");
  console.log(`📡 App URL: ${APP_URL}`);
  console.log(`🔑 Using Vapi Private Key: ${VAPI_PRIVATE_KEY.substring(0, 10)}...`);

  // Build server functions configuration (Vapi uses "tools" array)
  const serverFunctions = flourishAssistantFunctions.map((func) => ({
    type: "function",
    function: {
      name: func.name,
      description: func.description,
      parameters: func.parameters,
    },
    serverUrl: `${APP_URL}/api/vapi/${func.name}`,
  }));

  // Assistant configuration (removed invalid properties)
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
    tools: serverFunctions,
  };

  try {
    // Create assistant via Vapi API
    const response = await fetch(`${VAPI_API_URL}/assistant`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${VAPI_PRIVATE_KEY}`,
      },
      body: JSON.stringify(assistantConfig),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Failed to create assistant:");
      console.error(`Status: ${response.status} ${response.statusText}`);
      console.error(`Error: ${errorText}`);
      
      // Try to parse as JSON for better error messages
      try {
        const errorJson = JSON.parse(errorText);
        console.error("Error details:", JSON.stringify(errorJson, null, 2));
      } catch {
        // Not JSON, already logged as text
      }
      
      process.exit(1);
    }

    const assistant = await response.json();
    
    console.log("✅ Assistant created successfully!");
    console.log("\n📋 Assistant Details:");
    console.log(`   ID: ${assistant.id}`);
    console.log(`   Name: ${assistant.name}`);
    console.log(`   Status: ${assistant.status || "active"}`);
    
    if (assistant.phoneNumberId) {
      console.log(`   Phone Number ID: ${assistant.phoneNumberId}`);
    }
    
    console.log("\n🔗 Next Steps:");
    console.log("1. Your assistant is ready to use!");
    console.log("2. You can test it in the Vapi dashboard");
    console.log("3. To get a phone number, configure one in the Vapi dashboard");
    console.log("4. Update your .env with the assistant ID if needed");
    
    return assistant;
  } catch (error) {
    console.error("❌ Error creating assistant:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Stack:", error.stack);
    }
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  createVapiAssistant()
    .then(() => {
      console.log("\n✨ Done!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Fatal error:", error);
      process.exit(1);
    });
}

export { createVapiAssistant };

