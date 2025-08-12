export default {
  routes: [
    {
      method: "POST",
      path: "/contact-submit",         // ← use a unique path
      handler: "contact.submit",
      config: { auth: false },
    },
    // optional GET so you can check in a browser
    {
      method: "GET",
      path: "/contact-submit",
      handler: "contact.health",
      config: { auth: false },
    },
  ],
};