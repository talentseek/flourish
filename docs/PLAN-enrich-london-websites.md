# Plan: Enrich London Shopping Centre Websites

> **Goal**: Perform web searches for 34 unmanaged London shopping centres to identify and populate their missing website URLs.

## 1. Scope
**Targets**: 34 unmanaged locations in the London area identified as missing websites (e.g., Aylesham Centre, Stratford Centre).

## 2. Methodology
We will follow the `location-enrichment` Tier 1 strategy:
1.  **Search**: Use `search_web` with query `"[Location Name] [City] official website"`.
2.  **Verify**: Check if the result looks like an official site (e.g., `.co.uk`, matching name) or a managed property page (e.g. `landsec.com/properties/...`).
    -   *Note*: The user requested "not managed by flourish", which these are.
3.  **Update**: Write finding to DB immediately.

## 3. Batches
To ensure accuracy and manage tool usage, we process in batches:

### Batch A (Top 12 by Size)
- Aylesham Centre
- Mall Wood Green
- Pavilions (Uxbridge)
- The Brewery (Romford)
- Stratford Centre
- St. Ann's (Harrow)
- The Centre (Feltham)
- Livat (Hammersmith)
- Royal Exchange
- St. Nicholas (Sutton)
- Walnuts (Orpington)
- St. George's (Harrow)

### Batch B (Mid 11)
- Palace Exchange (Enfield)
- O2 Centre (Finchley)
- Broadwalk (Edgware)
- Vicarage Field (Barking)
- Times Square (Sutton)
- Catford Centre
- Victoria Place
- Nags Head (Holloway)
- The Oaks (Acton)
- The Mall (Bromley)
- Swanley Square

### Batch C (Smallest 11)
- Shopstop Clapham
- West One
- Arcadia (Ealing)
- Blenheim (Penge)
- Oxo Tower Wharf
- The Forge
- Leegate
- Portobello Green
- Hillwood
- The Poultry
- Orchard Place

## 4. Execution
I will perform the searches using the `search_web` tool directly and report back with a list of found URLs to confirm before bulk updating, or update as I go if confidence is high.
*Refinement*: User said "identify any which might actually have websites". I will report the findings.

## 5. Verification
- [ ] List of found websites provided to user.
- [ ] Database updated (upon confirmation).
