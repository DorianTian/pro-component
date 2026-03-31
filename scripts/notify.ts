/**
 * Multi-channel notification dispatcher for CI/CD pipelines.
 * Supports WeChat Work, Slack, and Email channels with retry logic.
 */
import { request } from 'node:https'

import { createCiLogger } from './ci/logger.js'

const logger = createCiLogger('notify')

interface NotifyPayload {
  channel: 'wechat' | 'slack' | 'email'
  title: string
  body: string
  level: 'info' | 'warning' | 'error'
  metadata?: Record<string, string>
}

interface ChannelConfig {
  wechatWebhookUrl?: string
  slackWebhookUrl?: string
  emailApiUrl?: string
  emailApiKey?: string
  emailRecipients?: string
}

function sendWechat(webhookUrl: string, payload: NotifyPayload): Promise<void> {
  const body = JSON.stringify({
    msgtype: 'markdown',
    markdown: {
      content: `### ${payload.title}\n${payload.body}`,
    },
  })

  return httpPost(webhookUrl, body)
}

function sendSlack(webhookUrl: string, payload: NotifyPayload): Promise<void> {
  const colorMap = { info: '#36a64f', warning: '#ffcc00', error: '#ff0000' }
  const body = JSON.stringify({
    attachments: [
      {
        color: colorMap[payload.level],
        title: payload.title,
        text: payload.body,
        fields: Object.entries(payload.metadata ?? {}).map(([k, v]) => ({
          title: k,
          value: v,
          short: true,
        })),
      },
    ],
  })

  return httpPost(webhookUrl, body)
}

function sendEmail(
  apiUrl: string,
  apiKey: string,
  recipients: string,
  payload: NotifyPayload,
): Promise<void> {
  const body = JSON.stringify({
    to: recipients.split(',').map((e) => e.trim()),
    subject: `[pro-components] ${payload.title}`,
    html: `<h2>${payload.title}</h2><p>${payload.body.replace(/\n/g, '<br>')}</p>`,
  })

  return httpPost(apiUrl, body, { Authorization: `Bearer ${apiKey}` })
}

function httpPost(url: string, body: string, extraHeaders?: Record<string, string>): Promise<void> {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url)
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        ...extraHeaders,
      },
    }

    const req = request(options, (res) => {
      let data = ''
      res.on('data', (chunk: Buffer) => {
        data += chunk.toString()
      })
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve()
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`))
        }
      })
    })

    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 1000): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (err: unknown) {
      if (attempt === retries) throw err
      const message = err instanceof Error ? err.message : String(err)
      logger.warn(`Attempt ${attempt} failed (${message}), retrying in ${delayMs}ms...`)
      await new Promise((r) => setTimeout(r, delayMs * attempt))
    }
  }
  throw new Error('Unreachable')
}

async function sendToChannel(
  channel: string,
  config: ChannelConfig,
  payload: NotifyPayload,
): Promise<void> {
  switch (channel) {
    case 'wechat': {
      const url = config.wechatWebhookUrl
      if (!url) throw new Error('WECHAT_WEBHOOK_URL not set')
      await withRetry(() => sendWechat(url, { ...payload, channel: 'wechat' }))
      break
    }
    case 'slack': {
      const url = config.slackWebhookUrl
      if (!url) throw new Error('SLACK_WEBHOOK_URL not set')
      await withRetry(() => sendSlack(url, { ...payload, channel: 'slack' }))
      break
    }
    case 'email': {
      const apiUrl = config.emailApiUrl
      const apiKey = config.emailApiKey
      if (!apiUrl || !apiKey) throw new Error('EMAIL_API_URL or EMAIL_API_KEY not set')
      const recipients = config.emailRecipients ?? ''
      await withRetry(() => sendEmail(apiUrl, apiKey, recipients, { ...payload, channel: 'email' }))
      break
    }
    default:
      logger.warn(`Unknown notification channel: ${channel}`)
  }
}

async function dispatchNotification(
  channel: string,
  config: ChannelConfig,
  payload: NotifyPayload,
): Promise<{ channel: string; success: boolean; error?: string }> {
  try {
    await sendToChannel(channel, config, payload)
    return { channel, success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    logger.error(`Failed to notify via ${channel}: ${message}`)
    return { channel, success: false, error: message }
  }
}

async function main(): Promise<void> {
  const title = process.env.NOTIFY_TITLE ?? 'CI Notification'
  const body = process.env.NOTIFY_BODY ?? ''
  const level = (process.env.NOTIFY_LEVEL ?? 'info') as NotifyPayload['level']
  const channels = (process.env.NOTIFY_CHANNELS ?? 'slack').split(',').map((c) => c.trim())
  const metadata: Record<string, string> = {}

  if (process.env.NOTIFY_METADATA) {
    try {
      Object.assign(metadata, JSON.parse(process.env.NOTIFY_METADATA))
    } catch {
      logger.warn('Failed to parse NOTIFY_METADATA, ignoring')
    }
  }

  const config: ChannelConfig = {
    wechatWebhookUrl: process.env.WECHAT_WEBHOOK_URL,
    slackWebhookUrl: process.env.SLACK_WEBHOOK_URL,
    emailApiUrl: process.env.EMAIL_API_URL,
    emailApiKey: process.env.EMAIL_API_KEY,
    emailRecipients: process.env.EMAIL_RECIPIENTS,
  }

  const payload: NotifyPayload = { channel: 'slack', title, body, level, metadata }

  const results = await Promise.all(
    channels.map((channel) => dispatchNotification(channel, config, payload)),
  )

  const anyFailed = results.some((r) => !r.success)
  if (anyFailed) {
    logger.warn('Some notification channels failed (non-blocking):')
    results.filter((r) => !r.success).forEach((r) => logger.warn(`  ${r.channel}: ${r.error}`))
  }

  logger.info('Notification dispatch complete')
}

main()
