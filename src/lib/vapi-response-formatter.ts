/**
 * Helper functions to format responses for Vapi tool calls
 */

export interface VapiToolCallRequest {
  message?: {
    toolCallList?: Array<{
      id: string;
      name: string;
      parameters: Record<string, any>;
    }>;
    toolWithToolCallList?: Array<{
      name: string;
      toolCall: {
        id: string;
        parameters: Record<string, any>;
      };
    }>;
  };
  toolCallId?: string;
  functionName?: string;
}

/**
 * Extract tool call information from Vapi request body
 * Vapi sends requests in format: { message: { toolCallList: [{ id, name, parameters }] } }
 * Or sometimes: { message: { toolWithToolCallList: [{ name, toolCall: { id, parameters } }] } }
 * Or direct format: { toolCallId: "...", locationName: "...", ... }
 */
export function extractVapiToolCall(body: any): {
  isVapiToolCall: boolean;
  toolCallId: string | null;
  functionName: string | null;
  parameters: Record<string, any>;
} {
  // Log the full request body for debugging
  console.log('[Vapi Debug] Full request body:', JSON.stringify(body, null, 2));
  
  // Check multiple possible Vapi request formats
  const hasMessage = !!body.message;
  const hasToolCallList = !!body.message?.toolCallList;
  const hasToolWithToolCallList = !!body.message?.toolWithToolCallList;
  const hasToolCallId = !!body.toolCallId;
  const hasCallId = !!body.call?.id;
  
  const isVapiToolCall = !!(hasToolCallList || hasToolWithToolCallList || hasToolCallId || hasCallId);
  
  let toolCallId: string | null = null;
  let functionName: string | null = null;
  let parameters: Record<string, any> = body;

  // Format 1: { message: { toolCallList: [{ id, function: { name, arguments } }] } }
  if (hasToolCallList && body.message.toolCallList.length > 0) {
    const toolCall = body.message.toolCallList[0];
    toolCallId = toolCall.id;
    functionName = toolCall.function?.name || toolCall.name;
    // Parameters are in function.arguments, not parameters
    if (toolCall.function?.arguments) {
      // Arguments might be a string or object
      if (typeof toolCall.function.arguments === 'string') {
        try {
          parameters = JSON.parse(toolCall.function.arguments);
        } catch {
          parameters = body;
        }
      } else {
        parameters = toolCall.function.arguments;
      }
    } else if (toolCall.parameters) {
      parameters = toolCall.parameters;
    } else {
      parameters = body;
    }
    console.log('[Vapi Debug] Format 1 detected - toolCallList');
  }
  // Format 2: { message: { toolWithToolCallList: [{ name, toolCall: { id, function: { arguments } } }] } }
  else if (hasToolWithToolCallList && body.message.toolWithToolCallList.length > 0) {
    const toolWithCall = body.message.toolWithToolCallList[0];
    toolCallId = toolWithCall.toolCall.id;
    functionName = toolWithCall.function?.name || toolWithCall.name;
    // Parameters are in toolCall.function.arguments
    if (toolWithCall.toolCall.function?.arguments) {
      if (typeof toolWithCall.toolCall.function.arguments === 'string') {
        try {
          parameters = JSON.parse(toolWithCall.toolCall.function.arguments);
        } catch {
          parameters = body;
        }
      } else {
        parameters = toolWithCall.toolCall.function.arguments;
      }
    } else if (toolWithCall.toolCall.parameters) {
      parameters = toolWithCall.toolCall.parameters;
    } else {
      parameters = body;
    }
    console.log('[Vapi Debug] Format 2 detected - toolWithToolCallList');
  }
  // Format 3: Direct format { toolCallId: "...", ...parameters }
  else if (hasToolCallId) {
    toolCallId = body.toolCallId;
    functionName = body.functionName || null;
    // Parameters are the rest of the body (excluding toolCallId and functionName)
    const { toolCallId: _, functionName: __, ...rest } = body;
    parameters = rest;
    console.log('[Vapi Debug] Format 3 detected - direct toolCallId');
  }
  // Format 4: { call: { id: "...", function: { name: "...", arguments: {...} } } }
  else if (hasCallId) {
    toolCallId = body.call.id;
    functionName = body.call.function?.name || null;
    // Arguments might be a string or object
    if (typeof body.call.function?.arguments === 'string') {
      try {
        parameters = JSON.parse(body.call.function.arguments);
      } catch {
        parameters = body;
      }
    } else {
      parameters = body.call.function?.arguments || body;
    }
    console.log('[Vapi Debug] Format 4 detected - call.id');
  }
  // Format 5: Check if this looks like a Vapi request (has locationName, etc.) but no toolCallId
  // In this case, we'll treat it as a Vapi request but generate a fallback ID
  else if (hasMessage && (body.locationName || body.targetLocationName)) {
    // This might be a Vapi request where toolCallId is missing
    // We'll use a fallback approach - check if Authorization header indicates Vapi
    console.log('[Vapi Debug] Format 5 detected - message with parameters but no toolCallId');
    // Don't set toolCallId here - let the caller handle it
  }

  console.log('[Vapi Debug] Extracted:', { 
    isVapiToolCall, 
    toolCallId, 
    functionName, 
    hasParameters: !!parameters,
    parameterKeys: Object.keys(parameters || {})
  });

  return {
    isVapiToolCall,
    toolCallId,
    functionName,
    parameters,
  };
}

/**
 * Format response for Vapi tool calls
 * Vapi expects: { results: [{ toolCallId: string, result: string }] }
 * IMPORTANT: result must be a single-line string (no line breaks)
 */
export function formatVapiResponse(
  toolCallId: string | null,
  result: string | object
): { results: Array<{ toolCallId: string; result: string }> } | null {
  if (!toolCallId) {
    return null;
  }

  // Convert result to string and remove line breaks (replace with spaces)
  let resultString: string;
  if (typeof result === 'string') {
    resultString = result.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
  } else {
    resultString = JSON.stringify(result).replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
  }

  return {
    results: [
      {
        toolCallId,
        result: resultString,
      },
    ],
  };
}

/**
 * Format error response for Vapi tool calls
 * IMPORTANT: Must use 'error' field, not 'result' field for errors
 */
export function formatVapiError(
  toolCallId: string | null,
  error: string
): { results: Array<{ toolCallId: string; error: string }> } | null {
  if (!toolCallId) {
    return null;
  }

  // Remove line breaks and ensure single line
  const errorString = error.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

  return {
    results: [
      {
        toolCallId,
        error: errorString,
      },
    ],
  };
}

