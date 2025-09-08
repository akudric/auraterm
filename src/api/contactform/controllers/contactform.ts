export default {
  async submit(ctx: any) {
    try {
      // Accept raw or { data: ... }
      const raw = ctx.request.body || {};
      const body = raw && raw.data && typeof raw.data === 'object' ? raw.data : raw;

      strapi.log.info(`[contactform.submit HIT] headers: ${JSON.stringify(ctx.request.headers)}`);
      strapi.log.info(`[contactform.submit HIT] raw body: ${JSON.stringify(ctx.request.body)}`);
      strapi.log.info(`[contactform.submit HIT] body: ${JSON.stringify(body)}`);

      // Honeypot
      if (body.company_website) {
        return ctx.send({ ok: true, spam: true }, 200);
      }

      // Required
      const missing = ['name', 'email', 'message'].filter(
        (k) => !String(body?.[k] || '').trim()
      );
      if (missing.length) {
        return ctx.send({ ok: false, message: `Missing: ${missing.join(', ')}` }, 400);
      }

      const kind = body.kind === 'specific' ? 'specific' : 'general';
      const subject =
        kind === 'specific'
          ? `[Quote][Specific] ${body.option || body.system_type || '-'} — ${body.name}`
          : `[Quote][General] ${body.name}`;

      const ua = ctx.request.header['user-agent'] || '-';
      const xff = ctx.request.header['x-forwarded-for'] || '';
      const ip =
        (Array.isArray(xff) ? xff[0] : xff).split(',')[0]?.trim() ||
        ctx.request.ip ||
        '-';

      const html = `
        <p>New ${kind.toUpperCase()} inquiry</p>
        <hr>
        <p>Name: ${body.name}</p>
        <p>Email: ${body.email}</p>
        <p>Phone: ${body.phone || '-'}</p>
        <p>System type: ${body.system_type || '-'}</p>
        ${kind === 'specific' ? `<p>Option: ${body.option || '-'}</p>` : ''}
        <p>Location: ${body.location || '-'}</p>
        <p>Page: ${body.pagePath || '-'}</p>
        <p>Client sent at: ${body.clientSentAt || '-'}</p>
        <p>Server received at: ${new Date().toISOString()}</p>
        <br>
        <p>Message:</p>
        <p>${body.message}</p>
        <br>
        <hr>
        <p>UA: ${ua}</p>
        <p>IP: ${ip}</p>
      `;

      const to = process.env.CONTACT_TO || 'requests@auraterm.hr';
      const from = process.env.EMAIL_FROM || 'requests@auraterm.hr';
      const replyTo = body.email;

      strapi.log.info(`Sending email to: ${to} from: ${from} replyTo: ${replyTo}`);
      await strapi.plugin('email').service('email').send({
        to,
        from,
        replyTo,
        subject,
        html,
      });

      return ctx.send({ ok: true, used: 'contactform.submit' }, 200);
      } catch (e: any) {
      // Nodemailer and provider errors often carry extra info
      const errorInfo = {
        name: e?.name,
        message: e?.message,
        stack: e?.stack,
        code: e?.code,
        command: e?.command,
        response: e?.response,         // SMTP / API server reply
        responseCode: e?.responseCode, // numeric SMTP code
        status: e?.status,             // HTTP status from API-based providers
        data: e?.data,                 // provider error body (e.g. SendGrid, Resend)
      };

      strapi.log.error('contactform.submit error', errorInfo);

      // You can even surface some of this to the client in dev mode only
      const isDev = process.env.NODE_ENV !== 'production';
      return ctx.send(
        {
          ok: false,
          message: 'Email send failed',
          ...(isDev ? { debug: errorInfo } : {}), // remove in prod
        },
        500
      );
    }
  },

  async health(ctx: any) {
    strapi.log.info('[contactform.health HIT]');
    ctx.send({ ok: false, message: 'This is the health endpoint. Please use /api/contactform/submit to submit the form.' }, 405);
  },
};