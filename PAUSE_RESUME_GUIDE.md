# ⏸️▶️ Pause & Resume Guide

## 🛑 TO PAUSE ALL ENRICHMENT (Before Traveling)

**Single Command:**
```bash
cd /Users/mbeckett/Documents/codeprojects/flourish
bash scripts/pause-all-enrichment.sh
```

This will:
- ✅ Stop all 4 enrichment scripts safely
- ✅ Save all progress automatically
- ✅ Show you what was completed
- ✅ Tell you where progress files are saved

**Your progress is 100% SAFE!**

---

## ▶️ TO RESUME ALL ENRICHMENT (When You Return)

**Two Commands:**
```bash
cd /Users/mbeckett/Documents/codeprojects/flourish

# Set API key (use your own OpenAI API key)
export OPENAI_API_KEY="your-openai-api-key-here"

# Resume all scripts
bash scripts/resume-all-enrichment.sh
```

This will:
- ✅ Restart all 4 enrichment scripts
- ✅ Resume from exactly where they left off
- ✅ Continue adding data to database
- ✅ Show you the status

---

## 📊 TO CHECK PROGRESS (Anytime)

```bash
cd /Users/mbeckett/Documents/codeprojects/flourish
bash scripts/check-all-enrichment.sh
```

---

## 🔧 MANUAL CONTROLS (If Needed)

### Pause Individual Scripts:
```bash
pkill -f "enrich-tenants-overnight"      # Stop tenant scraping
pkill -f "enrich-parallel-social"        # Stop social media
pkill -f "enrich-parallel-operational"   # Stop operational
pkill -f "enrich-parallel-websites"      # Stop website discovery
```

### Resume Individual Scripts:
```bash
cd /Users/mbeckett/Documents/codeprojects/flourish
export OPENAI_API_KEY="your_key"

# Tenant enrichment
nohup pnpm tsx scripts/enrich-tenants-overnight.ts tier1 > /tmp/tenant-enrichment-final.log 2>&1 &

# Social media
nohup pnpm tsx scripts/enrich-parallel-social.ts > /tmp/social-enrichment.log 2>&1 &

# Operational
nohup pnpm tsx scripts/enrich-parallel-operational.ts > /tmp/operational-enrichment.log 2>&1 &

# Website discovery
nohup pnpm tsx scripts/enrich-parallel-websites.ts > /tmp/website-discovery-parallel.log 2>&1 &
```

---

## 📁 WHERE PROGRESS IS SAVED

All progress is automatically saved to these files:

| Script | Progress File | Log File |
|--------|--------------|----------|
| Tenant | `/tmp/tenant-enrichment-progress.json` | `/tmp/tenant-enrichment-final.log` |
| Social | Automatic resume | `/tmp/social-enrichment.log` |
| Operational | Automatic resume | `/tmp/operational-enrichment.log` |
| Websites | Automatic resume | `/tmp/website-discovery-parallel.log` |

**You can safely pause and resume as many times as needed!**

---

## ✅ WHAT GETS SAVED

When you pause:

**Tenant Enrichment:**
- ✅ Completed location IDs
- ✅ Success/fail counts
- ✅ Total stores added
- ✅ Will skip completed locations on resume

**Social Media:**
- ✅ All found social links are in database
- ✅ Will skip locations already enriched

**Operational:**
- ✅ All operational data is in database
- ✅ Will skip locations already enriched

**Website Discovery:**
- ✅ All found websites are in database
- ✅ Will skip locations with websites

---

## 🎯 QUICK REFERENCE

```bash
# PAUSE (before traveling)
bash scripts/pause-all-enrichment.sh

# RESUME (when you return)
export OPENAI_API_KEY="your_key"
bash scripts/resume-all-enrichment.sh

# CHECK STATUS (anytime)
bash scripts/check-all-enrichment.sh
```

---

## 💡 IMPORTANT NOTES

1. **Progress is saved to database immediately** - no data loss!
2. **Tenant enrichment** uses progress.json to resume
3. **Other scripts** automatically skip completed items
4. **Safe to pause/resume multiple times**
5. **No need to worry about duplicates** - scripts handle this

---

## 🚀 WHEN YOU RETURN

1. Navigate to project: `cd /Users/mbeckett/Documents/codeprojects/flourish`
2. Set API key: `export OPENAI_API_KEY="your_key"`
3. Resume: `bash scripts/resume-all-enrichment.sh`
4. Check status: `bash scripts/check-all-enrichment.sh`

**Everything will continue from exactly where it stopped!** ✨

---

**Have a safe trip!** 🚗✈️

