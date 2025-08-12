export default {
  async submit(ctx) {
    const { name, email, phone, message } = ctx.request.body || {};
    if (!name || !email || !message) return ctx.badRequest("Missing required fields");
    await strapi.plugin("email").service("email").send({
      to: process.env.CONTACT_TO || "requests@auraterm.hr",
      from: process.env.EMAIL_FROM || "requests@auraterm.hr",
      replyTo: email,
      subject: `Novi upit — ${name}`,
      text: `Ime: ${name}\nEmail: ${email}\n${phone ? `Mobitel: ${phone}\n` : ""}Poruka:\n${message}`,
      html: `<p><b>Ime:</b> ${name}</p><p><b>Email:</b> ${email}</p>${phone ? `<p><b>Mobitel:</b> ${phone}</p>` : ""}<p><b>Poruka:</b></p><p>${String(message).replace(/\n/g,"<br>")}</p>`
    });
    return ctx.send({ ok: true });
  },
  async health(ctx) { ctx.send({ ok: true, service: "contact-submit" }); },
};