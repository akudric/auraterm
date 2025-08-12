export default {
  async submit(ctx) {
    ctx.send({ ok: true, message: "POST handler reached" });
  },
  async health(ctx) {
    ctx.send({ ok: true, service: "contactform" });
  },
};