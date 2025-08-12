export default {
  async submit(ctx) {
    const { name, email, phone, message } = ctx.request.body || {};
    if (!name || !email || !message) {
      return ctx.badRequest("Missing required fields");
    }

    try {
      const html =
        `<p><strong>Ime:</strong> ${name}</p>` +
        `<p><strong>Email:</strong> ${email}</p>` +
        (phone ? `<p><strong>Mobitel:</strong> ${phone}</p>` : "") +
        `<p><strong>Poruka:</strong></p><p>${String(message).replace(/\n/g,"<br>")}</p>`;

      await strapi.plugin("email").service("email").send({
        to: process.env.CONTACT_TO || "requests@auraterm.hr",
        from: process.env.EMAIL_FROM || "requests@auraterm.hr",
        replyTo: email,
        subject: `Novi upit sa stranice — ${name}`,
        text: `Ime: ${name}\nEmail: ${email}\n${phone ? "Mobitel: " + phone + "\n" : ""}\nPoruka:\n${message}`,
        html,
      });

      return ctx.send({ ok: true });
    } catch (err) {
      strapi.log.error("Contact email failed", err);
      return ctx.internalServerError("Email failed");
    }
  },

  // Optional GET so you can see something in a browser:
  async health(ctx) {
    ctx.send({ ok: true, service: "contact" });
  },
};