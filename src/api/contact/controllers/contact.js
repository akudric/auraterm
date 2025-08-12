// src/api/contact/controllers/contact.js
"use strict";

module.exports = {
  async submit(ctx) {
    const { name, email, message } = ctx.request.body || {};

    if (!name || !email || !message) {
      return ctx.badRequest("Missing required fields");
    }

    try {
      await strapi.plugin("email").service("email").send({
        to: process.env.CONTACT_TO || "support@yourcompany.com",
        from: process.env.EMAIL_FROM || "no-reply@yourcompany.com",
        replyTo: email,
        subject: `New contact from ${name}`,
        text: `From: ${name} <${email}>\n\n${message}`,
        html: `<p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
               <p>${String(message).replace(/\n/g, "<br>")}</p>`,
      });

      return ctx.send({ ok: true });
    } catch (err) {
      strapi.log.error("Contact email failed", err);
      return ctx.internalServerError("Email failed");
    }
  },
};