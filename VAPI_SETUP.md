# Vapi Voice Assistant Setup Guide

This guide will help you configure the Flourish Assistant voice agent. You can create it programmatically via API or manually in the Vapi dashboard.

## Prerequisites

- Vapi account with API keys:
  - Private Key: `3a4cda78-0d09-4a50-8833-0a6b211dde80`
  - Public Key: `8855fa42-df57-4574-8cf1-a7888b14166a`
- Deployed Flourish application URL
- Clerk authentication configured

## Method 1: Create Assistant Programmatically (Recommended)

### Option A: Via API Endpoint

1. **Deploy your Flourish application** (push to GitHub if using Vercel)
2. **Set environment variables** in your deployment:
   - `VAPI_PRIVATE_KEY=3a4cda78-0d09-4a50-8833-0a6b211dde80`
   - `NEXT_PUBLIC_APP_URL=https://your-app-url.com` (or Vercel will auto-set this)
3. **Call the create endpoint** as an admin user:
   ```bash
   curl -X POST https://your-app-url.com/api/vapi/create-assistant \
     -H "Authorization: Bearer YOUR_CLERK_SESSION_TOKEN" \
     -H "Content-Type: application/json"
   ```
   Or use the admin UI in your Flourish app

### Option B: Via Script

1. **Set environment variables**:
   ```bash
   export VAPI_PRIVATE_KEY=3a4cda78-0d09-4a50-8833-0a6b211dde80
   export NEXT_PUBLIC_APP_URL=https://your-app-url.com
   ```
2. **Run the script**:
   ```bash
   pnpm vapi:create-assistant
   ```

The script will automatically:
- Create the assistant with all 5 server functions
- Configure voice, model, and conversation settings
- Set up function endpoints pointing to your deployed app

## Method 2: Create Assistant Manually in Vapi Dashboard

## Step 1: Create Assistant in Vapi Dashboard

1. Log in to [Vapi Dashboard](https://dashboard.vapi.ai)
2. Navigate to "Assistants" section
3. Click "Create New Assistant"
4. Name it "Flourish Assistant"

## Step 2: Configure Basic Settings

### General Settings
- **Name**: Flourish Assistant
- **First Message**: "Hello! I'm your Flourish Assistant. I can help you analyze shopping centres, compare tenant mixes, and provide recommendations to improve footfall and sales. What would you like to know?"
- **Language**: English (en)

### Model Configuration
- **Provider**: OpenAI
- **Model**: gpt-4 (or gpt-4-turbo for faster responses)
- **Temperature**: 0.7
- **Max Tokens**: 300

### Voice Settings
- **Provider**: 11labs (or your preferred provider)
- **Voice**: Choose a professional, friendly voice
- **Stability**: 0.5
- **Similarity Boost**: 0.75

## Step 3: Configure Server Functions

Add the following server functions in the Vapi dashboard. Each function points to a Flourish API endpoint.

### Function 1: searchLocation

- **Name**: `searchLocation`
- **Description**: Search for a shopping centre or retail location by name
- **Server URL**: `https://your-app-url.com/api/vapi/location-search`
- **Method**: POST
- **Headers**: 
  ```
  Content-Type: application/json
  Authorization: Bearer {clerk_session_token}
  ```
- **Parameters**:
  ```json
  {
    "locationName": "string (required)",
    "city": "string (optional)"
  }
  ```

### Function 2: getLocationDetails

- **Name**: `getLocationDetails`
- **Description**: Get detailed information about a specific shopping centre
- **Server URL**: `https://your-app-url.com/api/vapi/location-details`
- **Method**: POST
- **Headers**: Same as above
- **Parameters**:
  ```json
  {
    "locationName": "string (required)"
  }
  ```

### Function 3: getLocalRecommendations

- **Name**: `getLocalRecommendations`
- **Description**: Get recommendations based on local area analysis
- **Server URL**: `https://your-app-url.com/api/vapi/local-recommendations`
- **Method**: POST
- **Headers**: Same as above
- **Parameters**:
  ```json
  {
    "locationName": "string (required)",
    "radiusKm": "number (optional, default: 5)",
    "detailLevel": "string (optional, 'high' or 'detailed', default: 'high')"
  }
  ```

### Function 4: analyzeTenantGaps

- **Name**: `analyzeTenantGaps`
- **Description**: Compare tenant mix with competitors
- **Server URL**: `https://your-app-url.com/api/vapi/tenant-gap-analysis`
- **Method**: POST
- **Headers**: Same as above
- **Parameters**:
  ```json
  {
    "targetLocationName": "string (required)",
    "competitorLocationNames": "array of strings (required)",
    "detailLevel": "string (optional, 'high' or 'detailed', default: 'high')"
  }
  ```

### Function 5: findNearbyCompetitors

- **Name**: `findNearbyCompetitors`
- **Description**: Find nearby competitor shopping centres
- **Server URL**: `https://your-app-url.com/api/vapi/nearby-competitors`
- **Method**: POST
- **Headers**: Same as above
- **Parameters**:
  ```json
  {
    "locationName": "string (required)",
    "radiusKm": "number (optional, default: 10)",
    "minStores": "number (optional)"
  }
  ```

## Step 4: Authentication Setup

Since Flourish uses Clerk authentication, you need to configure Vapi to pass authentication headers:

1. In Vapi dashboard, configure custom headers for each server function
2. Add header: `Authorization: Bearer {user_session_token}`
3. Vapi should handle passing the Clerk session token automatically if configured

**Note**: You may need to create a middleware endpoint that accepts Vapi's authentication and forwards requests with Clerk tokens, or configure Vapi to use Clerk's API directly.

## Step 5: Test the Assistant

1. Use Vapi's test interface to try sample queries:
   - "Tell me about Manchester Arndale"
   - "What recommendations do you have for Bluewater Shopping Centre?"
   - "Compare The Trafford Centre with nearby competitors"
   - "Find competitors near Meadowhall"

2. Verify that functions are being called correctly
3. Check that responses are formatted properly for voice delivery

## Step 6: Configure Phone Number (Optional)

1. In Vapi dashboard, go to "Phone Numbers"
2. Either purchase a new number or import an existing one
3. Assign the number to your Flourish Assistant
4. Configure inbound/outbound calling settings

## Step 7: Embed Widget (Optional)

If you want to embed the voice assistant in the Flourish app:

1. Get the Vapi widget code from the dashboard
2. Update `src/components/flourish-assistant-client.tsx` to include the widget
3. Configure the widget with your assistant ID

## Function Response Format

All Flourish API endpoints return responses in this format:

```json
{
  "success": true,
  "data": { /* endpoint-specific data */ },
  "summary": "Natural language summary for voice",
  "details": "Optional detailed information",
  "insights": ["Array of actionable insights"]
}
```

The `summary` field is optimized for voice delivery and should be read directly by the assistant.

## Troubleshooting

### Functions Not Being Called
- Verify server URLs are correct and accessible
- Check authentication headers are properly configured
- Ensure Vapi can reach your deployed application

### Authentication Errors
- Verify Clerk session tokens are being passed correctly
- Check that user is authenticated in Flourish
- Review Clerk webhook configuration if needed

### Location Not Found
- Location names use fuzzy matching
- Try using partial names (e.g., "Manchester Arndale" instead of full name)
- Check that the location exists in the Flourish database

### Voice Quality Issues
- Adjust voice provider settings (stability, similarity boost)
- Try different voice models
- Check audio quality settings in Vapi dashboard

## Reference Files

- Function schemas: `src/lib/vapi-functions.ts`
- API endpoints: `src/app/api/vapi/`
- Response formatters: `src/lib/vapi-formatters.ts`
- Location resolver: `src/lib/vapi-location-resolver.ts`
- Example config: `vapi-assistant-config.json`

## Support

For Vapi-specific issues, consult [Vapi Documentation](https://docs.vapi.ai)
For Flourish API issues, check the API endpoint logs and error messages

