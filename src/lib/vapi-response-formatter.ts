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
 */
export function extractVapiToolCall(body: any): {
  isVapiToolCall: boolean;
  toolCallId: string | null;
  functionName: string | null;
  parameters: Record<string, any>;
} {
  const isVapiToolCall = !!(body.message?.toolCallList || body.toolCallId || body.message?.toolWithToolCallList);
  
  let toolCallId: string | null = null;
  let functionName: string | null = null;
  let parameters: Record<string, any> = body;

  if (body.message?.toolCallList && body.message.toolCallList.length > 0) {
    toolCallId = body.message.toolCallList[0].id;
    functionName = body.message.toolCallList[0].name;
    parameters = body.message.toolCallList[0].parameters;
  } else if (body.message?.toolWithToolCallList && body.message.toolWithToolCallList.length > 0) {
    toolCallId = body.message.toolWithToolCallList[0].toolCall.id;
    functionName = body.message.toolWithToolCallList[0].name;
    parameters = body.message.toolWithToolCallList[0].toolCall.parameters;
  } else if (body.toolCallId) {
    toolCallId = body.toolCallId;
    functionName = body.functionName || null;
    parameters = body;
  }

  return {
    isVapiToolCall,
    toolCallId,
    functionName,
    parameters,
  };
}

/**
 * Format response for Vapi tool calls
 * Vapi expects: { results: [{ toolCallId: string, result: string | object }] }
 */
export function formatVapiResponse(
  toolCallId: string | null,
  result: string | object
): { results: Array<{ toolCallId: string; result: string | object }> } | null {
  if (!toolCallId) {
    return null;
  }

  return {
    results: [
      {
        toolCallId,
        result,
      },
    ],
  };
}

/**
 * Format error response for Vapi tool calls
 */
export function formatVapiError(
  toolCallId: string | null,
  error: string
): { results: Array<{ toolCallId: string; result: string }> } | null {
  if (!toolCallId) {
    return null;
  }

  return {
    results: [
      {
        toolCallId,
        result: `Error: ${error}`,
      },
    ],
  };
}

