export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email is required' });
  }

  // Fan-out: Resend (primary store) + Discord (notifications)
  const tasks = [
    // 1. Resend API — primary source of truth
    async () => {
      const resendApiKey = process.env.RESEND_API_KEY;
      const audienceId = process.env.RESEND_AUDIENCE_ID;

      if (!resendApiKey) {
        console.warn('Resend config missing');
        throw new Error('Resend config missing');
      }

      const body = { email, unsubscribed: false };
      // Support both old-style audience IDs and new-style segment IDs
      if (audienceId) {
        body.segments = [{ id: audienceId }];
      }

      const response = await fetch('https://api.resend.com/contacts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errData = await response.json();
        console.error('Resend Error:', errData);
        throw new Error('Resend subscription failed');
      }
      return { name: 'Resend', success: true };
    },
    // 2. Discord Webhook — team notification
    async () => {
      const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

      if (!webhookUrl) {
        console.warn('Discord webhook URL missing');
        throw new Error('Discord config missing');
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `🦞 **New Waitlist Lead:** \`${email}\` has joined the queue!`,
        }),
      });

      if (!response.ok) {
        console.error('Discord Error: Status', response.status);
        throw new Error('Discord notification failed');
      }
      return { name: 'Discord', success: true };
    },
  ];

  // Parallel execution with individual error handling
  const results = await Promise.allSettled(tasks.map(t => t()));

  const anySuccess = results.some(r => r.status === 'fulfilled');
  const failures = results
    .filter(r => r.status === 'rejected')
    .map(r => r.reason.message);

  if (failures.length > 0) {
    console.error('Waitlist fan-out partial failures:', failures);
  }

  // Return 200 as long as Resend captured the email (the primary store)
  if (anySuccess) {
    return res.status(200).json({ success: true });
  }

  return res.status(500).json({
    error: 'Service temporarily unavailable. Please try again or contact welcome@simway.io.'
  });
}
