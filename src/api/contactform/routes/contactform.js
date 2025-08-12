export default {
  routes: [
    {
      method: "POST",
      path: "/contactform",
      handler: "contactform.submit",
      config: { auth: false },
    },
    {
      method: "GET", // optional for browser check
      path: "/contactform",
      handler: "contactform.health",
      config: { auth: false },
    },
  ],
};