export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const activity = req.body;

  const tokenCache = {
    value: null,
    expires: 0,
    isValid() {
      return this.value && Date.now() < this.expires;
    },
    set(token, ttlMinutes = 55) {
      this.value = token;
      this.expires = Date.now() + ttlMinutes * 60 * 1000;
    },
    clear() {
      this.value = null;
      this.expires = 0;
    }
  };

  const withRetry = async (fn, maxRetries = 2) => {
    let attempt = 0;
    const errors = [];
    while (attempt <= maxRetries) {
      try {
        return await fn();
      } catch (error) {
        attempt++;
        errors.push(error.message);
        if (attempt > maxRetries) {
          throw new Error(errors.join(' | '));
        }
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
      }
    }
  };

  const getWhatsAppToken = async (credentials) => {
    if (tokenCache.isValid()) {
      return tokenCache.value;
    }
    const response = await withRetry(async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const res = await fetch('https://dev.nitzap.com/whatsapp/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(`Login failed: ${res.status} - ${errorData}`);
      }
      return res.json();
    });

    tokenCache.set(response.sessionToken || response.token);
    return tokenCache.value;
  };

  const sendWhatsAppMessage = async (config, contactData) => {
    const parseTemplate = (text) => 
      text.replace(/\{\{(\w+)\}\}/g, (_, field) => 
        contactData[field] || config[field] || '');

    const destination = contactData[config.destinationField] || config.destination;
    if (!destination) throw new Error(`No destination phone number found in field: ${config.destinationField}`);

    const message = {
      to: destination,
      message: parseTemplate(config.text),
      type: config.messageType || 'text'
    };

    if (message.type !== 'text') {
      message.media = { url: config.mediaUrl };
      if (message.type === 'document') message.media.fileName = config.fileName;
      if (message.type === 'video') message.media.mimetype = config.mimetype || 'video/mp4';
    }

    const token = await getWhatsAppToken({
      username: config.numberConnect,
      password: config.secret
    });

    return withRetry(async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const res = await fetch('https://dev.nitzap.com/whatsapp/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(message),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(`Message send failed: ${res.status} - ${errorData}`);
      }

      return res.json();
    });
  };

  try {
    const config = activity.arguments?.execute?.inArguments?.[0] || {};
    const contactData = activity.contactData || {};

    if (!config.numberConnect || !config.secret) {
      throw new Error('Configuration incomplete - missing credentials');
    }

    const result = await sendWhatsAppMessage(config, contactData);
    console.log(`Message sent to ${result.to} successfully`);

    return res.status(200).json({
      status: 'success',
      message: 'Message sent',
      response: result
    });
  } catch (error) {
    console.error('Error in custom activity:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message,
      stack: error.stack
    });
  }
}