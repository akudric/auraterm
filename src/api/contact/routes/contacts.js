// Strapi v5: use ESM default export
export default {
  routes: [
    {
      method: "POST",
      path: "/contact",
      handler: "contact.submit",
      config: { auth: false },
    },
    // (Optional) quick browser check:
    {
      method: "GET",
      path: "/contact",
      handler: "contact.health",
      config: { auth: false },
    },
  ],
};