# UK Demographics Guide

Extracting Census 2021 data for location enrichment.

---

## Step 1: Identify LTLA

Lower Tier Local Authority (LTLA) = Districts, Boroughs, Cities

### Common Examples
| City/Town | LTLA Name |
|-----------|-----------|
| Canterbury | Canterbury |
| Margate | Thanet |
| Maidstone | Maidstone |
| Ashford | Ashford |
| Brighton | Brighton and Hove |
| Portsmouth | Portsmouth |
| Milton Keynes | Milton Keynes |
| Leeds | Leeds |
| Manchester | Manchester |
| Edinburgh | City of Edinburgh |

---

## Step 2: Access ONS Data

### Census 2021 Area Profiles
```
URL: ons.gov.uk/visualisations/censusareachanges/
Search: [LTLA name]
```

### NOMIS Local Area Profiles
```
URL: nomisweb.co.uk/reports/lmp/la/
Search: [LTLA code or name]
```

---

## Step 3: Extract Fields

### Population
- Source: Census 2021 "usual residents"
- Field: `population` (Integer)
- UK Total: ~67.1 million

### Median Age
- Source: Census 2021 age profile
- Field: `medianAge` (Integer)
- UK Median: 40

### Families Percent
- Definition: Households with dependent children
- Field: `familiesPercent` (Decimal)
- UK Average: ~28%

### Seniors Percent
- Definition: Population aged 65+
- Field: `seniorsPercent` (Decimal)
- UK Average: ~18.6%

### Average Household Income
- Source: NOMIS/ONS income data
- Field: `avgHouseholdIncome` (Decimal)
- UK Median: ~£31,400

### Income vs National
- Calculation: `((local - national) / national) * 100`
- Field: `incomeVsNational` (Decimal, can be negative)

### Homeownership
- Source: Census 2021 tenure
- Field: `homeownership` (Decimal)
- UK Average: ~62.5%

### Homeownership vs National
- Calculation: `local - 62.5`
- Field: `homeownershipVsNational` (Decimal)

### Car Ownership
- Source: Census 2021 car/van availability
- Definition: Households with 1+ car
- Field: `carOwnership` (Decimal)
- UK Average: ~76.7%

### Car Ownership vs National
- Calculation: `local - 76.7`
- Field: `carOwnershipVsNational` (Decimal)

---

## National Averages (2021)

| Metric | UK Average |
|--------|------------|
| Median Age | 40 |
| Families % | 28% |
| Seniors (65+) % | 18.6% |
| Median Income | £31,400 |
| Homeownership | 62.5% |
| Car Ownership | 76.7% |

---

## Example: Canterbury

```
population: 157400
medianAge: 41
familiesPercent: 28.0
seniorsPercent: 23.5
avgHouseholdIncome: 34200
incomeVsNational: 8.9  # (34200-31400)/31400*100
homeownership: 60
homeownershipVsNational: -2.5  # 60 - 62.5
carOwnership: 74.0
carOwnershipVsNational: -2.7  # 74 - 76.7
```
