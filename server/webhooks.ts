
interface WebhookPayload {
  event: string;
  user: {
    id: number;
    username: string;
    email: string;
    name: string;
    createdAt: string;
  };
  timestamp: string;
}

interface WebhookConfig {
  url: string;
  secret?: string;
  events: string[];
}

// Configure your webhook endpoints here
const WEBHOOK_CONFIGS: WebhookConfig[] = [
  {
    url: process.env.USER_REGISTRATION_WEBHOOK_URL || '',
    secret: process.env.WEBHOOK_SECRET || '',
    events: ['user.registered']
  }
  // Add more webhook configs as needed
];

export async function triggerWebhook(event: string, data: any) {
  const webhooksToTrigger = WEBHOOK_CONFIGS.filter(config => 
    config.url && config.events.includes(event)
  );

  for (const webhook of webhooksToTrigger) {
    try {
      await sendWebhook(webhook, event, data);
    } catch (error) {
      console.error(`Failed to send webhook to ${webhook.url}:`, error);
    }
  }
}

async function sendWebhook(config: WebhookConfig, event: string, data: any) {
  const payload: WebhookPayload = {
    event,
    user: data,
    timestamp: new Date().toISOString()
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': 'ScatteredLights-Webhook/1.0'
  };

  // Add signature if secret is provided
  if (config.secret) {
    const crypto = require('crypto');
    const signature = crypto
      .createHmac('sha256', config.secret)
      .update(JSON.stringify(payload))
      .digest('hex');
    headers['X-Webhook-Signature'] = `sha256=${signature}`;
  }

  const response = await fetch(config.url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Webhook failed with status ${response.status}`);
  }

  console.log(`Webhook sent successfully to ${config.url} for event: ${event}`);
}
