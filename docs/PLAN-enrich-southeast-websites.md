# Plan: Enrich South East Shopping Centre Websites

> **Goal**: Perform web searches for 27 unmanaged South East shopping centres to identify and populate their missing website URLs.

## 1. Scope
**Targets**: 27 unmanaged locations in Kent, Surrey, Sussex, Hampshire, Bucks, and Oxon.

## 2. Methodology
We will follow the `location-enrichment` Tier 1 strategy:
1.  **Search**: Use `search_web` with query `"[Location Name] [City] official website"`.
2.  **Verify**: Check for official domain.
3.  **Update**: Write finding to DB immediately.

## 3. Batches

### Batch A (Surrey & Kent)
1. Sandgate Lanes (Folkestone)
2. St. Martins Walk (Dorking)
3. Swan Shopping Centre (Leatherhead)
4. The Elmsleigh Centre (Staines)
5. The Heart Of Walton (Walton-on-Thames)
6. Tunsgate Quarter (Guildford)
7. Victoria Place (Woking)

### Batch B (Sussex & Hampshire)
8. Queens Walk (East Grinstead)
9. The Martlets (Burgess Hill)
10. Windmill Shopping Village (Bognor Regis)
11. Montague Quarter (Worthing)
12. The Meridian Centre (Peacehaven)
13. The Quintins Centre (Hailsham)
14. The Arcade (Aldershot)
15. The Chantry Centre (Andover)
16. The Furlong (Ringwood)
17. The Swan (Eastleigh)
18. Whiteley Shopping Centre (Fareham)
19. The Malls (Basingstoke)
20. Greywell Shopping Centre (Havant)
21. The Marlands (Southampton)

### Batch C (Bucks & Oxon)
22. The Chilterns (High Wycombe)
23. Meadow Shopping Centre (Buckingham)
24. The Kidlington Centre (Kidlington)
25. The Calthorpe Centre (Banbury)
26. Woolgate Shopping Centre (Witney)
27. Abbey Shopping Centre (Abingdon)

## 4. Execution
I will perform the searches using `search_web` and report findings.

## 5. Verification
- [ ] List of found websites provided to user.
- [ ] Database updated.
