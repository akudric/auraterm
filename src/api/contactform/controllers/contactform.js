export default {
  async submit(ctx) {
    ctx.send({ ok: true, where: "POST /api/contactform" });
  },

  async health(ctx) {
    ctx.send({ ok: true, service: "contactform" });
  },
};