export default {
  routes: [
    {
      method: 'POST',
      path: '/contactform/submit',
      handler: 'contactform.submit',
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/contactform',
      handler: 'contactform.health',
      config: { auth: false },
    },
  ],
};