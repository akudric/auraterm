import Router from "@koa/router";

export default {
  // leave register empty
  register() {},

  // mount routes here so body parsing is already active
  bootstrap({ strapi }) {
    const router = new Router({ prefix: "/api" });

    router.get("/contactform", async (ctx) => {
      ctx.body = { ok: true, service: "contactform" };
    });

    router.post("/contactform", async (ctx) => {
      const { name, email, phone, message } = ctx.request.body || {};

      if (!name || !email || !message) {
        ctx.status = 400;
        ctx.body = {
          ok: false,
          error: "Missing required fields",
          // debug so we can see what arrived
          received: ctx.request.body ?? null,
        };
        return;
      }

      try {
        const html =
          `<p><strong>Ime:</strong> ${name}</p>` +
          `<p><strong>Email:</strong> ${email}</p>` +
          (phone ? `<p><strong>Mobitel:</strong> ${phone}</p>` : "") +
          `<p><strong>Poruka:</strong></p><p>${String(message).replace(/\n/g, "<br>")}</p>`;

        await strapi.plugin("email").service("email").send({
          to: process.env.CONTACT_TO || "info@auraterm.hr",
          from: process.env.EMAIL_FROM || "info@auraterm.hr",
          replyTo: email,
          subject: `Novi upit — ${name}`,
          text: `Ime: ${name}\nEmail: ${email}\n${phone ? `Mobitel: ${phone}\n` : ""}Poruka:\n${message}`,
          html,
        });

        ctx.body = { ok: true };
      } catch (err) {
        strapi.log.error("Email send failed", err);
        ctx.status = 500;
        ctx.body = { ok: false, error: "Email failed" };
      }
    });

    strapi.server.use(router.routes());
    strapi.server.use(router.allowedMethods());
  },
};