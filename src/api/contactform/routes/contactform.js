export default {
  routes: [
    {
      method: "POST",
      path: "/contactform",
      handler: "contactform.submit",
      config: { auth: false },
    },
    {
      method: "GET", // quick browser test
      path: "/contactform",
      handler: "contactform.health",
      config: { auth: false },
    },
  ],
};