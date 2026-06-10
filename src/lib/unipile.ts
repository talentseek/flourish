/**
 * Unipile API client for Flourish Outreach.
 * All functions take an accountId parameter for multi-user support.
 * Ported from flourishoutreach/src/client/unipile.ts
 */

const UNIPILE_DSN = process.env.UNIPILE_DSN || ''
const UNIPILE_API_KEY = process.env.UNIPILE_API_KEY || ''

const baseHeaders = {
    'X-API-KEY': UNIPILE_API_KEY,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
}

// ─── Low-level helpers ──────────────────────────────────────

async function apiGet(path: string): Promise<unknown> {
    const url = `${UNIPILE_DSN}${path}`
    const res = await fetch(url, { headers: baseHeaders })
    if (!res.ok) {
        const body = await res.text()
        throw new Error(`Unipile GET ${path} failed (${res.status}): ${body}`)
    }
    return res.json()
}

async function apiPost(path: string, body: unknown): Promise<unknown> {
    const url = `${UNIPILE_DSN}${path}`
    const res = await fetch(url, {
        headers: baseHeaders,
        method: 'POST',
        body: JSON.stringify(body),
    })
    if (!res.ok) {
        const text = await res.text()
        throw new Error(`Unipile POST ${path} failed (${res.status}): ${text}`)
    }
    return res.json()
}

function withAccount(path: string, accountId: string): string {
    const sep = path.includes('?') ? '&' : '?'
    return `${path}${sep}account_id=${accountId}`
}

// ─── LinkedIn: Invitations ──────────────────────────────────

/** Send a blank connection request (no note). */
export async function sendBlankInvite(
    accountId: string,
    providerId: string
): Promise<unknown> {
    return apiPost('/api/v1/users/invite', {
        account_id: accountId,
        provider_id: providerId,
    })
}

// ─── LinkedIn: Messaging ────────────────────────────────────

/** Send a message to a connected user. */
export async function sendMessage(
    accountId: string,
    providerId: string,
    text: string
): Promise<unknown> {
    const chat = (await apiPost('/api/v1/chats', {
        account_id: accountId,
        attendees_ids: [providerId],
        text,
    })) as { chat_id?: string }
    return chat
}

/** Check if a lead has sent us any messages. */
export async function hasIncomingMessages(
    accountId: string,
    providerId: string
): Promise<boolean> {
    try {
        const chat = (await apiPost('/api/v1/chats', {
            account_id: accountId,
            attendees_ids: [providerId],
        })) as { chat_id?: string; id?: string }

        const chatId = chat.chat_id ?? chat.id
        if (!chatId) return false

        const messagesResult = (await apiGet(
            withAccount(`/api/v1/chats/${chatId}/messages`, accountId)
        )) as { items?: Array<{ sender_id?: string; body?: string }> }

        const messages = messagesResult.items ?? []
        return messages.some((m) => m.sender_id !== accountId)
    } catch {
        return false
    }
}

/** Get incoming message text for opt-out detection. */
export async function getIncomingMessageText(
    accountId: string,
    providerId: string
): Promise<string | null> {
    try {
        const chat = (await apiPost('/api/v1/chats', {
            account_id: accountId,
            attendees_ids: [providerId],
        })) as { chat_id?: string; id?: string }

        const chatId = chat.chat_id ?? chat.id
        if (!chatId) return null

        const messagesResult = (await apiGet(
            withAccount(`/api/v1/chats/${chatId}/messages`, accountId)
        )) as { items?: Array<{ sender_id?: string; body?: string }> }

        const messages = messagesResult.items ?? []
        const incoming = messages.filter((m) => m.sender_id !== accountId)
        return incoming.map((m) => m.body ?? '').join(' ')
    } catch {
        return null
    }
}

// ─── LinkedIn: Profile Lookup ───────────────────────────────

/** Extract provider_id from a LinkedIn URL's miniProfileUrn parameter. */
export function extractProviderIdFromUrl(profileUrl: string): string | null {
    try {
        const url = new URL(profileUrl)
        const miniProfileUrn = url.searchParams.get('miniProfileUrn')
        if (miniProfileUrn) {
            const decoded = decodeURIComponent(miniProfileUrn)
            const match = decoded.match(/ACoAA[A-Za-z0-9_-]+/)
            return match ? match[0] : null
        }
    } catch {
        // URL parsing failed
    }
    return null
}

/** Resolve a profile URL to a provider_id. */
export async function getUserProfile(
    accountId: string,
    profileUrl: string
): Promise<unknown> {
    const fromUrl = extractProviderIdFromUrl(profileUrl)
    if (fromUrl) {
        return { provider_id: fromUrl }
    }

    try {
        const url = new URL(profileUrl)
        const pathParts = url.pathname.split('/').filter(Boolean)
        const publicId = pathParts[pathParts.length - 1]
        if (publicId) {
            return apiGet(
                withAccount(`/api/v1/users/${encodeURIComponent(publicId)}`, accountId)
            )
        }
    } catch {
        // URL parsing failed
    }

    return { provider_id: null }
}

/** Check if we're connected to a user. */
export async function isConnected(
    accountId: string,
    providerId: string
): Promise<boolean> {
    try {
        const url = withAccount(`/api/v1/users/${providerId}`, accountId)
        const data = (await apiGet(url)) as Record<string, unknown>

        const distance = data?.network_distance
        const relStatus = data?.relationship_status

        if (relStatus === 'CONNECTED' || relStatus === 'connected') return true
        if (distance === 1 || distance === '1' || distance === 'FIRST_DEGREE')
            return true

        return false
    } catch {
        return false
    }
}

// ─── Email ──────────────────────────────────────────────────

/** Send an email via Unipile's email API using multipart/form-data. */
export async function sendEmail(
    accountId: string,
    to: { display_name: string; identifier: string },
    subject: string,
    body: string
): Promise<boolean> {
    const formData = new FormData()
    formData.append('account_id', accountId)
    formData.append('subject', subject)

    const htmlBody = body
        .split('\n')
        .map((line) =>
            line.trim() === ''
                ? '<br>'
                : `<p style="margin:0 0 8px 0">${line}</p>`
        )
        .join('\n')
    formData.append('body', htmlBody)
    formData.append('to', JSON.stringify([to]))
    formData.append('tracking', JSON.stringify({ opens: true, clicks: false }))

    try {
        const res = await fetch(`${UNIPILE_DSN}/api/v1/emails`, {
            method: 'POST',
            headers: { 'X-API-KEY': UNIPILE_API_KEY },
            body: formData,
        })

        if (!res.ok) {
            const text = await res.text()
            console.error(`[Unipile] Email send failed (${res.status}): ${text}`)
            return false
        }

        return true
    } catch (err) {
        console.error('[Unipile] Email send error', err)
        return false
    }
}

// ─── Hosted Auth ────────────────────────────────────────────

/** Generate a Unipile Hosted Auth link for account connection. */
export async function getHostedAuthLink(
    provider: 'LINKEDIN' | 'MICROSOFT',
    callbackUrl: string
): Promise<string | null> {
    try {
        const providerMap: Record<string, string> = {
            LINKEDIN: 'LINKEDIN',
            MICROSOFT: 'MICROSOFT',
        }
        const result = (await apiPost('/api/v1/hosted/accounts/link', {
            type: 'create',
            api_url: UNIPILE_DSN,
            providers: [providerMap[provider]],
            success_redirect_url: callbackUrl,
            failure_redirect_url: callbackUrl + '?error=connection_failed',
            notify_url: callbackUrl.replace('/connect', '/api/outreach/connect-callback'),
        })) as { url?: string }

        return result.url || null
    } catch (err) {
        console.error('[Unipile] Hosted auth link error:', err)
        return null
    }
}

/** Get account details to verify connection status. */
export async function getAccountDetails(
    accountId: string
): Promise<{ id: string; status: string; email?: string; name?: string } | null> {
    try {
        const data = (await apiGet(`/api/v1/accounts/${accountId}`)) as Record<
            string,
            unknown
        >
        return {
            id: accountId,
            status: (data.status as string) || 'ACTIVE',
            email: data.email as string | undefined,
            name: data.name as string | undefined,
        }
    } catch {
        return null
    }
}
