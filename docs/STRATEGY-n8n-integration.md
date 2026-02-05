# FLOURISH AUTOMATION: Brain + Tools Bridge (n8n)

## 🏗️ The Problem
Enrichment is manual and slow. We have 2,700+ locations and only 1.6% have commercial data. We cannot scale the "Spacebook" solution without real-time data ingestion.

## 🧠 The Brain Workflow (n8n ID: Flourish-Enricher-Brain)
**Trigger:** Webhook (POST) receiving `locationId` and `websiteUrl`.
1. **Tool 1 (Firecrawl):** Scrapes the `websiteUrl` for full tenant directory.
2. **Tool 2 (Perplexity):** Searches for "2024 footfall [Location Name]" and "owner of [Location Name]".
3. **Tool 3 (Prisma Bridge):** Executes a `PUT` request back to our `/api/locations/enrich` endpoint to update the DB.

## 🛠️ Implementation Plan
1. **N8N Setup:** I will draft the JSON for this "Brain" workflow using the `n8n-workflow-builder` skill.
2. **API Endpoint:** I need to create a secure `POST /api/admin/enrichment/ingest` in the Flourish app to handle the data coming back from n8n.
3. **The Test:** Trigger the brain for **Paula Muers' 13 locations**. If successful, we have a fully autonomous enrichment factory.

---
*Status: Drafting Workflow JSON...*
