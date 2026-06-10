-- Outreach Models Migration
-- Applied via `prisma db push` due to shadow DB issues with existing migrations

-- User Integrations (LinkedIn, Microsoft account connections via Unipile)
CREATE TABLE IF NOT EXISTS "user_integrations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "unipileAccountId" TEXT NOT NULL,
    "email" TEXT,
    "displayName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "user_integrations_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "user_integrations_userId_provider_key" UNIQUE ("userId", "provider"),
    CONSTRAINT "user_integrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
);

-- Outreach Campaigns
CREATE TABLE IF NOT EXISTS "outreach_campaigns" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "businessCategory" TEXT,
    "searchPostcode" TEXT,
    "searchRadius" INTEGER,
    "linkedinMessage" TEXT,
    "emailSubject" TEXT,
    "emailBody" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "outreach_campaigns_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "outreach_campaigns_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id")
);
CREATE INDEX IF NOT EXISTS "outreach_campaigns_userId_idx" ON "outreach_campaigns"("userId");
CREATE INDEX IF NOT EXISTS "outreach_campaigns_status_idx" ON "outreach_campaigns"("status");

-- Outreach Leads
CREATE TABLE IF NOT EXISTS "outreach_leads" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "googleRating" DECIMAL(2,1),
    "googleReviews" INTEGER,
    "placeId" TEXT,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "contactName" TEXT,
    "contactEmail" TEXT,
    "linkedinUrl" TEXT,
    "jobTitle" TEXT,
    "enrichmentScore" INTEGER,
    "enrichmentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "linkedinInviteSentAt" TIMESTAMP(3),
    "linkedinInviteAccepted" TIMESTAMP(3),
    "linkedinMessageSentAt" TIMESTAMP(3),
    "emailSentAt" TIMESTAMP(3),
    "repliedAt" TIMESTAMP(3),
    "replyChannel" TEXT,
    "personalization" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "outreach_leads_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "outreach_leads_campaignId_placeId_key" UNIQUE ("campaignId", "placeId"),
    CONSTRAINT "outreach_leads_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "outreach_campaigns"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "outreach_leads_campaignId_idx" ON "outreach_leads"("campaignId");
CREATE INDEX IF NOT EXISTS "outreach_leads_status_idx" ON "outreach_leads"("status");

-- Outreach Events (sent message/email log)
CREATE TABLE IF NOT EXISTS "outreach_events" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "subject" TEXT,
    "body" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "outreach_events_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "outreach_events_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "outreach_leads"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "outreach_events_leadId_idx" ON "outreach_events"("leadId");

-- Daily Send Counts (rate limiting per user per channel)
CREATE TABLE IF NOT EXISTS "daily_send_counts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "channel" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "daily_send_counts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "daily_send_counts_userId_date_channel_key" UNIQUE ("userId", "date", "channel")
);
