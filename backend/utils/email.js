const nodemailer = require('nodemailer');

const createTransport = () => nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: Number(process.env.EMAIL_PORT) === 465, // FIX: ensure number comparison
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false // FIX: required on many cloud providers (Render)
  }
});

const emailTemplates = {
  welcome: (name) => ({
    subject: '🚀 Welcome to TaskFlow!',
    html: `
      <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:auto;background:#0f172a;color:#e2e8f0;border-radius:12px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:40px;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:28px">⚡ TaskFlow</h1>
          <p style="color:rgba(255,255,255,0.8);margin:8px 0 0">Team Task Manager</p>
        </div>
        <div style="padding:40px">
          <h2 style="color:#a5b4fc">Welcome, ${name}! 👋</h2>
          <p style="color:#94a3b8;line-height:1.6">
            You've successfully joined TaskFlow.
          </p>
          <a href="${process.env.CLIENT_URL}/login"
             style="display:inline-block;background:#6366f1;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600">
            Go to Dashboard →
          </a>
        </div>
      </div>
    `
  }),

  taskAssigned: (assigneeName, taskTitle, projectName, assignerName, dueDate) => ({
    subject: `📋 New Task Assigned: ${taskTitle}`,
    html: `<p>${assigneeName}, ${assignerName} assigned "${taskTitle}" in ${projectName}</p>`
  }),

  taskUpdated: (userName, taskTitle, oldStatus, newStatus) => ({
    subject: `🔄 Task Updated: ${taskTitle}`,
    html: `<p>${userName}, status changed ${oldStatus} → ${newStatus}</p>`
  }),

  projectInvite: (userName, projectName, inviterName) => ({
    subject: `🎯 Project: ${projectName}`,
    html: `<p>${inviterName} added you to ${projectName}</p>`
  }),

  passwordReset: (name, resetUrl) => ({
    subject: '🔐 Password Reset',
    html: `<a href="${resetUrl}">Reset Password</a>`
  })
};

const sendEmail = async (to, templateName, ...args) => {
  try {
    const transport = createTransport();

    // FIX: verify connection before sending
    await transport.verify();

    const template = emailTemplates[templateName](...args);

    await transport.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject: template.subject,
      html: template.html
    });

    console.log(`✉️ Email sent → ${to}`);
    return true;

  } catch (error) {
    console.error('❌ Email error:', error);
    return false;
  }
};

module.exports = { sendEmail };
