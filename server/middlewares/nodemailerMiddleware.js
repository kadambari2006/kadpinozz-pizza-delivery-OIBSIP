const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const emailBaseTemplate = require('../utils/emailBaseTemplate');

dotenv.config();

/**
 * Creates a Nodemailer transporter from env vars.
 * Supports both naming conventions:
 *   NODEMAILER_SMTP_EMAIL / NODEMAILER_SMTP_PASSWORD
 *   EMAIL_USER / EMAIL_PASS
 */
const createTransporter = () => {
  const host =
    process.env.NODEMAILER_SMTP_HOST ||
    process.env.EMAIL_HOST ||
    'smtp.gmail.com';
  const port = Number(
    process.env.NODEMAILER_SMTP_PORT || process.env.EMAIL_PORT || 587
  );
  const email = (
    process.env.NODEMAILER_SMTP_EMAIL ||
    process.env.EMAIL_USER ||
    ''
  ).trim();
  const pass = (
    process.env.NODEMAILER_SMTP_PASSWORD ||
    process.env.EMAIL_PASS ||
    ''
  ).trim();
  const secure =
    process.env.NODEMAILER_SMTP_SECURE === 'true' ||
    process.env.EMAIL_SECURE === 'true' ||
    port === 465;

  // If credentials are placeholders or blank, return null for dev fallback
  if (
    !email ||
    !pass ||
    email.includes('your_email') ||
    pass.includes('your_email')
  ) {
    return null;
  }

  const isGmail =
    host.toLowerCase().includes('gmail') ||
    email.toLowerCase().includes('@gmail.com');

  const transportConfig = {
    host,
    port,
    secure,
    auth: { user: email, pass },
    tls: { rejectUnauthorized: false },
  };

  // Gmail works most reliably with service flag
  if (isGmail) {
    transportConfig.service = 'gmail';
  }

  return nodemailer.createTransport(transportConfig);
};

/**
 * sendEmail — sends a branded KaDpinozz HTML email via SMTP
 * Supports both:
 *   sendEmail({ to, subject, templateOptions, from, text })
 *   sendEmail(to, subject, htmlOrBody)
 */
const sendEmail = async (optionsOrTo, subjectArg, bodyArg) => {
  dotenv.config();

  let to, subject, templateOptions, from, text, directHtml;

  if (typeof optionsOrTo === 'object' && optionsOrTo !== null) {
    to = optionsOrTo.to;
    subject = optionsOrTo.subject;
    templateOptions = optionsOrTo.templateOptions || {};
    from = optionsOrTo.from;
    text = optionsOrTo.text;
  } else {
    to = optionsOrTo;
    subject = subjectArg;
    directHtml = bodyArg;
    templateOptions = {
      title: subjectArg,
      message: bodyArg,
    };
  }

  const smtpUser = (
    process.env.NODEMAILER_SMTP_EMAIL ||
    process.env.EMAIL_USER ||
    ''
  ).trim();

  const html = directHtml
    ? (directHtml.includes('<html') ? directHtml : emailBaseTemplate(templateOptions))
    : emailBaseTemplate(templateOptions);

  const mailOptions = {
    from: from || `KaDpinozz 🌿 <${smtpUser || 'no-reply@kadpinozz.com'}>`,
    to,
    subject,
    html,
    text:
      text ||
      (templateOptions && templateOptions.message
        ? templateOptions.message.replace(/<[^>]*>?/gm, '')
        : ''),
  };

  const transporter = createTransporter();

  if (transporter) {
    try {
      console.log(
        `[SMTP] Sending to ${to} via ${process.env.EMAIL_HOST || process.env.NODEMAILER_SMTP_HOST || 'smtp.gmail.com'}...`.cyan
      );
      const info = await transporter.sendMail(mailOptions);
      console.log(
        `[SMTP ✅] Email sent! MessageId: ${info.messageId}`.green.bold
      );
      return info;
    } catch (err) {
      console.error(`[SMTP ❌] Delivery failed: ${err.message}`.red.bold);
      // Log to terminal as fallback so dev can still see email
      console.log('\n--- [FALLBACK: SMTP Failed — Email Content] ---'.yellow);
      console.log(`To: ${to}`.yellow);
      console.log(`Subject: ${subject}`.yellow);
      if (templateOptions && templateOptions.message)
        console.log(
          `Content:\n${templateOptions.message.replace(/<[^>]*>?/gm, '')}`
        );
      console.log('------------------------------------------------\n'.yellow);
      return { messageId: 'smtp-error-fallback', accepted: [to] };
    }
  }

  // No credentials configured — print to terminal
  console.log(
    '\n--- [DEV MODE: No SMTP configured — Notification] ---'.cyan.bold
  );
  console.log(`To: ${to}`.yellow);
  console.log(`Subject: ${subject}`.yellow);
  if (templateOptions && templateOptions.title)
    console.log(`Title: ${templateOptions.title}`.green);
  if (templateOptions && templateOptions.message)
    console.log(
      `Message:\n${templateOptions.message.replace(/<[^>]*>?/gm, '')}`.white
    );
  console.log('-------------------------------------------------------\n'.cyan.bold);

  return { messageId: 'dev-mock-id', accepted: [to] };
};

module.exports = sendEmail;
