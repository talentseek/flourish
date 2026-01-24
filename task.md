# Task: Top 100 UK Shopping Centres (Market Data)

## Goal
Build a comprehensive dataset of the UK's Top 100 Shopping Centres to enable market statistics and competitive analysis. These locations will be **Unmanaged** (`isManaged: false`) but **Enriched**.

## Status Overview
| Metric | Count |
| :--- | :--- |
| **Identified Targets** | 45 (Phase 1) |
| **Seeded/Matched** | 0 |
| **Fully Enriched** | 0 |

## Workstreams

- [ ] **Phase 1: Identity & Seeding**
    - [ ] [Create `task.md`](task_item_1)
    - [ ] [Script: Seed Top 45 Giants](task_item_2)
        - *Fixes Lakeside, Arndale, Merry Hill matches*
        - *Creates missing centres (MK, St Davids, East Kilbride)*
    - [ ] [Verify Canonical Records](task_item_3)

- [ ] **Phase 2: Enrichment (Market Data)**
    - [ ] [Update Enrichment Scripts to support Unmanaged](task_item_4)
    - [ ] [Batch 13: London & South East Giants](task_item_5)
    - [ ] [Batch 14: Midlands & North Giants](task_item_6)
    - [ ] [Batch 15: Scotland, Wales & NI Giants](task_item_7)

- [ ] **Phase 3: The Next 55**
    - [ ] Identify Ranks 46-100
    - [ ] Seed & Enrich
