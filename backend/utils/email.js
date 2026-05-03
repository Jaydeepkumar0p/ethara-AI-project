// ===============================
// 📦 IMPORT DEPENDENCIES
// ===============================
const nodemailer = require("nodemailer");


// ===============================
// ⚙️ CREATE TRANSPORTER (ONLY ONCE)
// ===============================
// We create transporter once and reuse it
// This improves performance and avoids repeated TLS handshakes

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",

  // ✅ Use SSL port (more stable on Render)
  port: 465,

  // ✅ Must be true for port 465
  secure: true,

  auth: {
    user: process.env.EMAIL_USER, // your Gmail
    pass: process.env.EMAIL_PASS, // 16-digit App Password (no spaces)
  },

  // ✅ Fix TLS issues in cloud environments
  tls: {
    rejectUnauthorized: false,
  },
});


// ===============================
// 🧪 VERIFY CONNECTION (DEBUG ONCE)
// ===============================
// This checks if SMTP is working at server start

transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP Connection Error:", error.message);
  } else {
    console.log("✅ SMTP Server Ready");
  }
});


// ===============================
// 📧 EMAIL TEMPLATES
// ===============================
// Each template returns { subject, html }

const emailTemplates = {

  // 🚀 Welcome Email
  welcome: (name) => ({
    subject: "🚀 Welcome to TaskFlow!",
    html: `
      <div style="font-family:sans-serif;padding:20px">
        <h2>Welcome ${name} 👋</h2>
        <p>Your account has been created successfully.</p>
        <a href="${process.env.CLIENT_URL}/login">
          Go to Dashboard →
        </a>
      </div>
    `,
  }),

  // 📋 Task Assigned
  taskAssigned: (assigneeName, taskTitle) => ({
    subject: `📋 New Task: ${taskTitle}`,
    html: `
      <div style="font-family:sans-serif;padding:20px">
        <h3>Hello ${assigneeName},</h3>
        <p>You have been assigned a new task:</p>
        <b>${taskTitle}</b>
      </div>
    `,
  }),

  // 🔄 Task Updated
  taskUpdated: (userName, taskTitle, oldStatus, newStatus) => ({
    subject: `🔄 Task Updated`,
    html: `
      <div style="font-family:sans-serif;padding:20px">
        <p>${userName}, your task <b>${taskTitle}</b> changed:</p>
        <p>${oldStatus} → ${newStatus}</p>
      </div>
    `,
  }),

  // 🎯 Project Invite
  projectInvite: (userName, projectName) => ({
    subject: `🎯 Project Invite`,
    html: `
      <div style="font-family:sans-serif;padding:20px">
        <p>Hello ${userName},</p>
        <p>You were added to project <b>${projectName}</b></p>
      </div>
    `,
  }),

  // 🔐 Password Reset
  passwordReset: (name, resetUrl) => ({
    subject: "🔐 Reset Password",
    html: `
      <div style="font-family:sans-serif;padding:20px">
        <p>Hello ${name},</p>
        <p>Click below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
      </div>
    `,
  }),
};


// ===============================
// 🚀 SEND EMAIL FUNCTION
// ===============================
const sendEmail = async (to, templateName, ...args) => {
  try {
    // Get template
    const template = emailTemplates[templateName](...args);

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: template.subject,
      html: template.html,
    });

    console.log(`✉️ Email sent: ${templateName} → ${to}`);
    return true;

  } catch (error) {
    // ❌ DO NOT CRASH APP
    console.error("❌ Email Error:", error.message);

    return false;
  }
};


// ===============================
// 📦 EXPORT FUNCTION
// ===============================
module.exports = { sendEmail };
