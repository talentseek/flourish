/**
 * Vapi Function Definitions for Flourish Assistant
 * 
 * These function schemas define the server functions that the Vapi voice agent
 * can call to interact with the Flourish API. The schemas follow Vapi's function
 * calling format, which is similar to OpenAI's function calling format.
 */

export interface VapiFunction {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, {
      type: string;
      description: string;
      required?: boolean;
    }>;
    required?: string[];
  };
}

/**
 * Search for a shopping centre by name
 */
export const searchLocationFunction: VapiFunction = {
  name: "searchLocation",
  description: "Search for a shopping centre or retail location by name. Use this when the user mentions a location name but you need to find it in the database.",
  parameters: {
    type: "object",
    properties: {
      locationName: {
        type: "string",
        description: "The name of the shopping centre or retail location to search for (e.g., 'Manchester Arndale', 'Bluewater Shopping Centre')",
      },
      city: {
        type: "string",
        description: "Optional city name to narrow down the search (e.g., 'Manchester', 'London')",
      },
    },
    required: ["locationName"],
  },
};

/**
 * Get detailed information about a specific location
 */
export const getLocationDetailsFunction: VapiFunction = {
  name: "getLocationDetails",
  description: "Get detailed information about a specific shopping centre including number of stores, floor area, parking, ratings, and other key metrics.",
  parameters: {
    type: "object",
    properties: {
      locationName: {
        type: "string",
        description: "The name of the shopping centre to get details for",
      },
    },
    required: ["locationName"],
  },
};

/**
 * Get local area recommendations based on category distribution
 */
export const getLocalRecommendationsFunction: VapiFunction = {
  name: "getLocalRecommendations",
  description: "Get recommendations for a shopping centre based on the local area analysis. This analyzes tenant categories within a radius and provides insights on what categories are popular or missing in the area. Use this when the user asks for recommendations about footfall, tenant mix, or what types of stores to add.",
  parameters: {
    type: "object",
    properties: {
      locationName: {
        type: "string",
        description: "The name of the shopping centre to get recommendations for",
      },
      radiusKm: {
        type: "number",
        description: "The radius in kilometers to analyze the local area (default: 5km)",
      },
      detailLevel: {
        type: "string",
        description: "Level of detail: 'high' for summary or 'detailed' for comprehensive analysis (default: 'high')",
        enum: ["high", "detailed"],
      },
    },
    required: ["locationName"],
  },
};

/**
 * Analyze tenant gaps compared to competitors
 */
export const analyzeTenantGapsFunction: VapiFunction = {
  name: "analyzeTenantGaps",
  description: "Compare a shopping centre's tenant mix with competitor locations to identify gaps, missing categories, and opportunities. Use this when the user wants to know how their location compares to competitors or what categories they're missing.",
  parameters: {
    type: "object",
    properties: {
      targetLocationName: {
        type: "string",
        description: "The name of the shopping centre to analyze",
      },
      competitorLocationNames: {
        type: "array",
        description: "Array of competitor location names to compare against",
        items: {
          type: "string",
        },
      },
      detailLevel: {
        type: "string",
        description: "Level of detail: 'high' for summary or 'detailed' for comprehensive analysis including specific brands (default: 'high')",
        enum: ["high", "detailed"],
      },
    },
    required: ["targetLocationName", "competitorLocationNames"],
  },
};

/**
 * Find nearby competitor shopping centres
 */
export const findNearbyCompetitorsFunction: VapiFunction = {
  name: "findNearbyCompetitors",
  description: "Find shopping centres within a specified radius of a location. Use this to discover competitors in the local area.",
  parameters: {
    type: "object",
    properties: {
      locationName: {
        type: "string",
        description: "The name of the shopping centre to find competitors near",
      },
      radiusKm: {
        type: "number",
        description: "The radius in kilometers to search for competitors (default: 10km)",
      },
      minStores: {
        type: "number",
        description: "Optional minimum number of stores to filter results (e.g., 20 to only show major competitors)",
      },
    },
    required: ["locationName"],
  },
};

/**
 * All available functions for the Flourish Assistant
 */
export const flourishAssistantFunctions: VapiFunction[] = [
  searchLocationFunction,
  getLocationDetailsFunction,
  getLocalRecommendationsFunction,
  analyzeTenantGapsFunction,
  findNearbyCompetitorsFunction,
];

/**
 * Export function configurations for Vapi dashboard
 * This format matches what Vapi expects for server function configuration
 */
export const vapiFunctionConfig = {
  serverUrl: process.env.NEXT_PUBLIC_APP_URL || "https://your-app-url.com",
  functions: flourishAssistantFunctions.map((func) => ({
    name: func.name,
    description: func.description,
    parameters: func.parameters,
    // Server function endpoints will be:
    // POST /api/vapi/{function-name}
    // Example: POST /api/vapi/searchLocation
  })),
};

/**
 * Helper to get function by name
 */
export function getFunctionByName(name: string): VapiFunction | undefined {
  return flourishAssistantFunctions.find((f) => f.name === name);
}

/**
 * Validate function parameters
 */
export function validateFunctionParameters(
  functionName: string,
  parameters: Record<string, any>
): { valid: boolean; errors?: string[] } {
  const func = getFunctionByName(functionName);
  if (!func) {
    return { valid: false, errors: [`Unknown function: ${functionName}`] };
  }

  const errors: string[] = [];
  const required = func.parameters.required || [];

  // Check required parameters
  for (const param of required) {
    if (!(param in parameters) || parameters[param] === undefined || parameters[param] === null) {
      errors.push(`Missing required parameter: ${param}`);
    }
  }

  // Validate parameter types
  for (const [key, value] of Object.entries(parameters)) {
    const paramDef = func.parameters.properties[key];
    if (!paramDef) {
      errors.push(`Unknown parameter: ${key}`);
      continue;
    }

    // Type validation
    if (paramDef.type === "number" && typeof value !== "number") {
      errors.push(`Parameter ${key} must be a number`);
    } else if (paramDef.type === "string" && typeof value !== "string") {
      errors.push(`Parameter ${key} must be a string`);
    } else if (paramDef.type === "array" && !Array.isArray(value)) {
      errors.push(`Parameter ${key} must be an array`);
    }

    // Enum validation
    if ("enum" in paramDef && !paramDef.enum?.includes(value)) {
      errors.push(`Parameter ${key} must be one of: ${paramDef.enum?.join(", ")}`);
    }
  }

  return { valid: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
}

