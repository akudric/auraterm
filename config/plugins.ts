export default ({ env }) => ({
  email: {
    config: {
      provider: "nodemailer",
      providerOptions: {
        host: env("SMTP_HOST", "mail.auraterm.hr"),
        port: env.int("SMTP_PORT", 465),
        secure: env.bool("SMTP_SECURE", true),
        auth: {
          user: env("SMTP_USER", "info@auraterm.hr"),
          pass: env("SMTP_PASS"),
        },
        tls: {
          // Allow self-signed cert
          rejectUnauthorized: false,
        },
      },
      settings: {
        defaultFrom: env("EMAIL_FROM", "info@auraterm.hr"),
        defaultReplyTo: env("EMAIL_REPLY_TO", "info@auraterm.hr"),
      },
    },
  },
});
