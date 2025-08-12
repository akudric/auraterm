module.exports = ({ env }) => ({
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('SMTP_HOST', 'mail.auraterm.hr'), 
        port: env.int('SMTP_PORT', 465),    
        secure: true,                              
        auth: {
          user: env('SMTP_USER', 'requests@auraterm.hr'), 
          pass: env('SMTP_PASS'),                       
        },
      },
      settings: {
        defaultFrom: env('EMAIL_FROM', 'requests@auraterm.hr'),
        defaultReplyTo: env('EMAIL_REPLY_TO', 'requests@auraterm.hr'),
      },
    },
  },
});