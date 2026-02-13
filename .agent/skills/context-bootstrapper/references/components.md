# Components Reference

## shadcn/ui Primitives (34)

Installed in `src/components/ui/`:

`accordion` · `alert` · `avatar` · `badge` · `breadcrumb` · `button` · `card` · `chart` · `checkbox` · `collapsible` · `command` · `dialog` · `drawer` · `dropdown-menu` · `form` · `input` · `label` · `popover` · `progress` · `scroll-area` · `select` · `separator` · `sheet` · `sidebar` · `skeleton` · `slider` · `sonner` · `switch` · `table` · `tabs` · `textarea` · `toggle` · `toggle-group` · `tooltip`

---

## Feature Components (by domain)

### Layout & Navigation
| Component | File | Purpose |
|-----------|------|---------|
| `AppSidebar` | `app-sidebar.tsx` | Main navigation sidebar |
| `NavMain` | `nav-main.tsx` | Primary navigation items |
| `ClientSidebarShell` | `client-sidebar-shell.tsx` | Client-side sidebar wrapper |
| `FlourishLogo` | `flourish-logo.tsx` | Brand logo component |
| `LogoCarousel` | `logo-carousel.tsx` | Partner/client logo display |

### Dashboard V2 (`dashboard2/`)
| Component | Purpose |
|-----------|---------|
| `Dashboard2Client` | Main dashboard client wrapper |
| `DashboardMetrics` | Key metrics display |
| `LocationDiscoveryPage` | Location browsing UI |
| `LocationSearchStage` | Search step |
| `LocationDiscoveryStage` | Discovery step |
| `ComparisonSetupStage` | Comparison configuration |
| `ReportGenerationStage` | Report output |
| `StageNavigation` | Wizard navigation |
| `LocationHeroSection` | Location header with image |
| `LocationMetricsGrid` | KPI grid |
| `LocationCommercialKpis` | Commercial performance |
| `LocationDemographicsSection` | Demographic data |
| `LocationOperationalSection` | Operational details |
| `LocationReviewsSection` | Google/Facebook reviews |
| `LocationSeoSection` | SEO data |
| `LocationSocialLinks` | Social media links |
| `LocationTenantsSection` | Tenant listing |
| `LocationCompactCards` | Compact location cards |
| `PdfDownloadButton` | PDF export |
| `AssistantWidget` | Embedded AI assistant |

### Maps & Geospatial
| Component | File | Purpose |
|-----------|------|---------|
| `GoogleMaps` | `google-maps.tsx` | Google Maps integration |
| `EnrichmentMap` | `enrichment/EnrichmentMap.tsx` | Leaflet-based enrichment coverage map |
| `MapControls` | `enrichment/MapControls.tsx` | Map filter controls |
| `RegionalMap` | `regional/regional-map.tsx` | Regional manager location map |

### Data Display & Analysis
| Component | File | Purpose |
|-----------|------|---------|
| `LocationDetails` | `location-details.tsx` | Full location detail view |
| `PublicLocationPage` | `public-location-page.tsx` | Public-facing location page |
| `GapAnalysisContent` | `gap-analysis-content.tsx` | Gap analysis interface |
| `GapPriorityCards` | `gap-priority-cards.tsx` | Priority gap cards |
| `MissingBrandsSection` | `missing-brands-section.tsx` | Missing brand opportunities |
| `EnrichmentLocationsTable` | `enrichment-locations-table.tsx` | Enrichment data table |
| `FieldDrilldownDialog` | `field-drilldown-dialog.tsx` | Field-level enrichment drilldown |

### Outreach
| Component | File | Purpose |
|-----------|------|---------|
| `OutreachClient` | `outreach-client.tsx` | Outreach workflow UI |
| `OutreachGapsClient` | `outreach-gaps-client.tsx` | Gap-based outreach |
| `OutreachSendClient` | `outreach-send-client.tsx` | Send outreach messages |

### AI & Voice
| Component | File | Purpose |
|-----------|------|---------|
| `FlourishAssistantClient` | `flourish-assistant-client.tsx` | VAPI voice assistant UI |
| `AiVoiceCallClient` | `ai-voice-call-client.tsx` | Voice call interface |
| `AiChat` | `regional/ai-chat.tsx` | Regional AI chat |

### Admin & Actions
| Component | File | Purpose |
|-----------|------|---------|
| `RefreshMetricsButton` | `refresh-metrics-button.tsx` | Trigger metrics recalculation |
| `CreateVapiAssistantButton` | `create-vapi-assistant-button.tsx` | Create VAPI assistant |
| `DeleteVapiAssistantButton` | `delete-vapi-assistant-button.tsx` | Delete VAPI assistant |
| `PrintButtons` | `print-buttons.tsx` | PDF/print controls |

### Marketing & Contact
| Component | File | Purpose |
|-----------|------|---------|
| `V2ContactSection` | `v2-contact-section.tsx` | V2 contact form |
| `DemoRequestModal` | `demo-request-modal.tsx` | Demo request dialog |
| `PreRegisterButton` | `pre-register-button.tsx` | Pre-registration CTA |
| `PreReservationDialog` | `pre-reservation-dialog.tsx` | Reservation dialog |

### Regional
| Component | File | Purpose |
|-----------|------|---------|
| `RegionalManagerWidget` | `regional-manager-widget.tsx` | Regional manager dashboard widget |

### Client Portals
Components for branded client portals (RivingtonHark, Landsec) are in their respective `src/app/` route directories as page-level client components.
