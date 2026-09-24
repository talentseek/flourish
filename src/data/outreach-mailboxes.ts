export interface DomainInfo {
  domain: string
  registrar: string
  status: 'ACTIVE' | 'PENDING_DNS' | 'WARMING'
  mailboxesCount: number
  spfValid: boolean
  dkimValid: boolean
  dmarcValid: boolean
  assignedRMs: string[]
}

export interface MailboxInfo {
  id: string
  email: string
  rmName: string
  rmRole: string
  rmCentresCount: number
  domain: string
  warmupPercent: number
  status: 'WARMING_UP' | 'READY' | 'PAUSED'
  dailySent: number
  dailyReceived: number
  inboxPlacementPercent: number
  spfStatus: 'PASS' | 'FAIL'
  dkimStatus: 'PASS' | 'FAIL'
  dmarcStatus: 'PASS' | 'FAIL'
  daysWarming: number
  targetDays: number
}

export interface WarmupSummary {
  overallWarmupPercent: number
  status: string
  totalDomains: number
  totalMailboxes: number
  activeRMsCount: number
  daysElapsed: number
  targetTotalDays: number
  estimatedCompletionDays: number
  averageInboxPlacement: number
  dailyWarmupVolume: number
  isOutreachPaused: boolean
}

export const WARMUP_SUMMARY: WarmupSummary = {
  overallWarmupPercent: 28,
  status: 'WARMING_UP',
  totalDomains: 7,
  totalMailboxes: 14,
  activeRMsCount: 5,
  daysElapsed: 6,
  targetTotalDays: 21,
  estimatedCompletionDays: 15,
  averageInboxPlacement: 98.6,
  dailyWarmupVolume: 168,
  isOutreachPaused: true,
}

export const DOMAINS_POOL: DomainInfo[] = [
  {
    domain: 'flourishreach.com',
    registrar: 'Spaceship',
    status: 'WARMING',
    mailboxesCount: 2,
    spfValid: true,
    dkimValid: true,
    dmarcValid: true,
    assignedRMs: ['Amanda Bishop', 'Callum Clifford'],
  },
  {
    domain: 'flourishsend.com',
    registrar: 'Spaceship',
    status: 'WARMING',
    mailboxesCount: 2,
    spfValid: true,
    dkimValid: true,
    dmarcValid: true,
    assignedRMs: ['Amanda Bishop', 'Callum Clifford'],
  },
  {
    domain: 'flourishintel.com',
    registrar: 'Spaceship',
    status: 'WARMING',
    mailboxesCount: 2,
    spfValid: true,
    dkimValid: true,
    dmarcValid: true,
    assignedRMs: ['Amanda Bishop', 'Paula Muers'],
  },
  {
    domain: 'flourishproptech.com',
    registrar: 'Spaceship',
    status: 'WARMING',
    mailboxesCount: 2,
    spfValid: true,
    dkimValid: true,
    dmarcValid: true,
    assignedRMs: ['Paula Muers', 'Sophie Sterland'],
  },
  {
    domain: 'flourishretailintel.com',
    registrar: 'Spaceship',
    status: 'WARMING',
    mailboxesCount: 2,
    spfValid: true,
    dkimValid: true,
    dmarcValid: true,
    assignedRMs: ['Paula Muers', 'Giorgia Shepherd'],
  },
  {
    domain: 'flourishretaildata.com',
    registrar: 'Spaceship',
    status: 'WARMING',
    mailboxesCount: 2,
    spfValid: true,
    dkimValid: true,
    dmarcValid: true,
    assignedRMs: ['Sophie Sterland', 'Giorgia Shepherd'],
  },
  {
    domain: 'flourishpropertydata.com',
    registrar: 'Spaceship',
    status: 'WARMING',
    mailboxesCount: 2,
    spfValid: true,
    dkimValid: true,
    dmarcValid: true,
    assignedRMs: ['Sophie Sterland', 'Giorgia Shepherd'],
  },
]

export const MAILBOXES_POOL: MailboxInfo[] = [
  // Amanda Bishop (21 centres - 3 mailboxes)
  {
    id: 'mb-amanda-1',
    email: 'amanda@flourishreach.com',
    rmName: 'Amanda Bishop',
    rmRole: 'Regional Manager',
    rmCentresCount: 21,
    domain: 'flourishreach.com',
    warmupPercent: 28,
    status: 'WARMING_UP',
    dailySent: 12,
    dailyReceived: 11,
    inboxPlacementPercent: 99.1,
    spfStatus: 'PASS',
    dkimStatus: 'PASS',
    dmarcStatus: 'PASS',
    daysWarming: 6,
    targetDays: 21,
  },
  {
    id: 'mb-amanda-2',
    email: 'amanda@flourishsend.com',
    rmName: 'Amanda Bishop',
    rmRole: 'Regional Manager',
    rmCentresCount: 21,
    domain: 'flourishsend.com',
    warmupPercent: 28,
    status: 'WARMING_UP',
    dailySent: 13,
    dailyReceived: 12,
    inboxPlacementPercent: 98.8,
    spfStatus: 'PASS',
    dkimStatus: 'PASS',
    dmarcStatus: 'PASS',
    daysWarming: 6,
    targetDays: 21,
  },
  {
    id: 'mb-amanda-3',
    email: 'amanda@flourishintel.com',
    rmName: 'Amanda Bishop',
    rmRole: 'Regional Manager',
    rmCentresCount: 21,
    domain: 'flourishintel.com',
    warmupPercent: 28,
    status: 'WARMING_UP',
    dailySent: 12,
    dailyReceived: 11,
    inboxPlacementPercent: 98.4,
    spfStatus: 'PASS',
    dkimStatus: 'PASS',
    dmarcStatus: 'PASS',
    daysWarming: 6,
    targetDays: 21,
  },

  // Paula Muers (14 centres - 3 mailboxes)
  {
    id: 'mb-paula-1',
    email: 'paula@flourishintel.com',
    rmName: 'Paula Muers',
    rmRole: 'Regional Manager',
    rmCentresCount: 14,
    domain: 'flourishintel.com',
    warmupPercent: 28,
    status: 'WARMING_UP',
    dailySent: 12,
    dailyReceived: 10,
    inboxPlacementPercent: 98.2,
    spfStatus: 'PASS',
    dkimStatus: 'PASS',
    dmarcStatus: 'PASS',
    daysWarming: 6,
    targetDays: 21,
  },
  {
    id: 'mb-paula-2',
    email: 'paula@flourishproptech.com',
    rmName: 'Paula Muers',
    rmRole: 'Regional Manager',
    rmCentresCount: 14,
    domain: 'flourishproptech.com',
    warmupPercent: 28,
    status: 'WARMING_UP',
    dailySent: 11,
    dailyReceived: 11,
    inboxPlacementPercent: 99.0,
    spfStatus: 'PASS',
    dkimStatus: 'PASS',
    dmarcStatus: 'PASS',
    daysWarming: 6,
    targetDays: 21,
  },
  {
    id: 'mb-paula-3',
    email: 'paula@flourishretailintel.com',
    rmName: 'Paula Muers',
    rmRole: 'Regional Manager',
    rmCentresCount: 14,
    domain: 'flourishretailintel.com',
    warmupPercent: 28,
    status: 'WARMING_UP',
    dailySent: 13,
    dailyReceived: 12,
    inboxPlacementPercent: 98.5,
    spfStatus: 'PASS',
    dkimStatus: 'PASS',
    dmarcStatus: 'PASS',
    daysWarming: 6,
    targetDays: 21,
  },

  // Sophie Sterland (12 centres - 3 mailboxes)
  {
    id: 'mb-sophie-1',
    email: 'sophie@flourishproptech.com',
    rmName: 'Sophie Sterland',
    rmRole: 'Regional Manager',
    rmCentresCount: 12,
    domain: 'flourishproptech.com',
    warmupPercent: 28,
    status: 'WARMING_UP',
    dailySent: 12,
    dailyReceived: 12,
    inboxPlacementPercent: 98.9,
    spfStatus: 'PASS',
    dkimStatus: 'PASS',
    dmarcStatus: 'PASS',
    daysWarming: 6,
    targetDays: 21,
  },
  {
    id: 'mb-sophie-2',
    email: 'sophie@flourishretaildata.com',
    rmName: 'Sophie Sterland',
    rmRole: 'Regional Manager',
    rmCentresCount: 12,
    domain: 'flourishretaildata.com',
    warmupPercent: 28,
    status: 'WARMING_UP',
    dailySent: 11,
    dailyReceived: 10,
    inboxPlacementPercent: 98.1,
    spfStatus: 'PASS',
    dkimStatus: 'PASS',
    dmarcStatus: 'PASS',
    daysWarming: 6,
    targetDays: 21,
  },
  {
    id: 'mb-sophie-3',
    email: 'sophie@flourishpropertydata.com',
    rmName: 'Sophie Sterland',
    rmRole: 'Regional Manager',
    rmCentresCount: 12,
    domain: 'flourishpropertydata.com',
    warmupPercent: 28,
    status: 'WARMING_UP',
    dailySent: 13,
    dailyReceived: 12,
    inboxPlacementPercent: 99.2,
    spfStatus: 'PASS',
    dkimStatus: 'PASS',
    dmarcStatus: 'PASS',
    daysWarming: 6,
    targetDays: 21,
  },

  // Giorgia Shepherd (11 centres - 3 mailboxes)
  {
    id: 'mb-giorgia-1',
    email: 'giorgia@flourishretailintel.com',
    rmName: 'Giorgia Shepherd',
    rmRole: 'Regional Manager',
    rmCentresCount: 11,
    domain: 'flourishretailintel.com',
    warmupPercent: 28,
    status: 'WARMING_UP',
    dailySent: 12,
    dailyReceived: 11,
    inboxPlacementPercent: 98.7,
    spfStatus: 'PASS',
    dkimStatus: 'PASS',
    dmarcStatus: 'PASS',
    daysWarming: 6,
    targetDays: 21,
  },
  {
    id: 'mb-giorgia-2',
    email: 'giorgia@flourishretaildata.com',
    rmName: 'Giorgia Shepherd',
    rmRole: 'Regional Manager',
    rmCentresCount: 11,
    domain: 'flourishretaildata.com',
    warmupPercent: 28,
    status: 'WARMING_UP',
    dailySent: 12,
    dailyReceived: 12,
    inboxPlacementPercent: 98.3,
    spfStatus: 'PASS',
    dkimStatus: 'PASS',
    dmarcStatus: 'PASS',
    daysWarming: 6,
    targetDays: 21,
  },
  {
    id: 'mb-giorgia-3',
    email: 'giorgia@flourishpropertydata.com',
    rmName: 'Giorgia Shepherd',
    rmRole: 'Regional Manager',
    rmCentresCount: 11,
    domain: 'flourishpropertydata.com',
    warmupPercent: 28,
    status: 'WARMING_UP',
    dailySent: 11,
    dailyReceived: 11,
    inboxPlacementPercent: 98.6,
    spfStatus: 'PASS',
    dkimStatus: 'PASS',
    dmarcStatus: 'PASS',
    daysWarming: 6,
    targetDays: 21,
  },

  // Callum Clifford (6 centres - 2 mailboxes, fewest centres among the 5)
  {
    id: 'mb-callum-1',
    email: 'callum@flourishreach.com',
    rmName: 'Callum Clifford',
    rmRole: 'Regional Manager',
    rmCentresCount: 6,
    domain: 'flourishreach.com',
    warmupPercent: 28,
    status: 'WARMING_UP',
    dailySent: 13,
    dailyReceived: 12,
    inboxPlacementPercent: 99.4,
    spfStatus: 'PASS',
    dkimStatus: 'PASS',
    dmarcStatus: 'PASS',
    daysWarming: 6,
    targetDays: 21,
  },
  {
    id: 'mb-callum-2',
    email: 'callum@flourishsend.com',
    rmName: 'Callum Clifford',
    rmRole: 'Regional Manager',
    rmCentresCount: 6,
    domain: 'flourishsend.com',
    warmupPercent: 28,
    status: 'WARMING_UP',
    dailySent: 12,
    dailyReceived: 11,
    inboxPlacementPercent: 98.5,
    spfStatus: 'PASS',
    dkimStatus: 'PASS',
    dmarcStatus: 'PASS',
    daysWarming: 6,
    targetDays: 21,
  },
]
