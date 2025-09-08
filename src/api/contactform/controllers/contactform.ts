export default {
  async submit(ctx: any) {
    try {
      const raw = ctx.request.body || {};
      const body = raw && raw.data && typeof raw.data === 'object' ? raw.data : raw;

      strapi.log.info(`[contactform.submit HIT] headers: ${JSON.stringify(ctx.request.headers)}`);
      strapi.log.info(`[contactform.submit HIT] raw body: ${JSON.stringify(ctx.request.body)}`);
      strapi.log.info(`[contactform.submit HIT] body: ${JSON.stringify(body)}`);

      if (body.company_website) {
        return ctx.send({ ok: true, spam: true }, 200);
      }

      const missing = ['name', 'email', 'message'].filter((k) => !String(body?.[k] || '').trim());
      if (missing.length) {
        return ctx.send({ ok: false, message: `Missing: ${missing.join(', ')}` }, 400);
      }

      const kind = body.kind === 'specific' ? 'specific' : 'general';
      const subject =
        kind === 'specific'
          ? `[Quote][Specific] ${body.option || body.system_type || '-'} — ${body.name}`
          : `[Quote][General] ${body.name}`;

      const ua = ctx.request.headers?.['user-agent'] || '-';
      const xff = ctx.request.headers?.['x-forwarded-for'] || '';
      const ip = (Array.isArray(xff) ? xff[0] : xff).split(',')[0]?.trim() || ctx.request.ip || '-';

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

      // ✅ NEW: log which provider is active + basic options
      const emailCfg = strapi.config.get('plugin.email', {});
      const providerName = strapi.config.get('plugin.email.config.provider', 'unknown');
      strapi.log.info(`[email] provider=${providerName}`);      strapi.log.info(`[email] provider=${providerName}`);
      strapi.log.info(`[contactform.submit] Email details - To: ${to}, From: ${from}, ReplyTo: ${replyTo}`);
      strapi.log.info(`[contactform.submit] Email Subject: ${subject}`);
      strapi.log.info(`[contactform.submit] Email HTML length: ${html.length}`);

      await strapi.plugin('email').service('email').send({ to, from, replyTo, subject, html });

      return ctx.send({ ok: true, used: 'contactform.submit' }, 200);
    } catch (e: any) {
      // ✅ NEW: show HTTP provider data (422 reasons) and SMTP specifics
      const status = e?.status ?? e?.response?.status;
      const data = e?.response?.data ?? e?.data ?? e?.response; // covers axios & others
      const info = {
        message: e?.message,
        status,
        responseCode: e?.responseCode,
        code: e?.code,
        command: e?.command,
        data,
      };
      try { strapi.log.error('[contactform.submit] error ' + JSON.stringify(info)); }
      catch { strapi.log.error('[contactform.submit] error (stringified failed): ' + String(e)); }

      // Keep response minimal; return 422 if provider said so
      return ctx.send({ ok: false, message: 'Email send failed' }, status === 422 ? 422 : 500);
    }
  },

  async health(ctx: any) {
    strapi.log.info('[contactform.health HIT]');
    ctx.send(
      { ok: false, message: 'This is the health endpoint. Please use /api/contactform/submit to submit the form.' },
      405
    );
  },
};