const nodemailer = require('nodemailer');

const createTransport = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: Number(process.env.EMAIL_PORT) === 465, // true for 465, false for 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 10000, // 10 sec
    greetingTimeout: 10000,
    socketTimeout: 10000
  });
};

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
            You've successfully joined TaskFlow. Start managing your team's tasks with ease,
            track progress in real-time, and never miss a deadline again.
          </p>
          <a href="${process.env.CLIENT_URL}/login"
             style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600">
            Go to Dashboard →
          </a>
        </div>
      </div>
    `
  }),

  taskAssigned: (assigneeName, taskTitle, projectName, assignerName, dueDate) => ({
    subject: `📋 New Task Assigned: ${taskTitle}`,
    html: `
      <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:auto;background:#0f172a;color:#e2e8f0;border-radius:12px">
        <div style="padding:30px">
          <h2>Hi ${assigneeName}</h2>
          <p>${assignerName} assigned you a task</p>
          <h3>${taskTitle}</h3>
          <p>Project: ${projectName}</p>
          ${dueDate ? `<p>Due: ${new Date(dueDate).toLocaleDateString()}</p>` : ''}
          <a href="${process.env.CLIENT_URL}/tasks">View Task</a>
        </div>
      </div>
    `
  }),

  taskUpdated: (userName, taskTitle, oldStatus, newStatus) => ({
    subject: `🔄 Task Updated: ${taskTitle}`,
    html: `
      <div>
        <p>Hi ${userName}</p>
        <p>${taskTitle}: ${oldStatus} → ${newStatus}</p>
      </div>
    `
  }),

  projectInvite: (userName, projectName, inviterName) => ({
    subject: `🎯 Added to project: ${projectName}`,
    html: `
      <div>
        <p>Hi ${userName}</p>
        <p>${inviterName} added you to ${projectName}</p>
      </div>
    `
  }),

  passwordReset: (name, resetUrl) => ({
    subject: '🔐 Password Reset',
    html: `
      <div>
        <p>Hi ${name}</p>
        <a href="${resetUrl}">Reset Password</a>
      </div>
    `
  })
};

const sendEmail = async (to, templateName, ...args) => {
  try {
    const transport = createTransport();

    // 🔥 IMPORTANT: verify connection before sending
    await transport.verify();

    const template = emailTemplates[templateName](...args);

    await transport.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: template.subject,
      html: template.html
    });

    console.log(`✉️ Email sent → ${to}`);
    return true;
  } catch (error) {
    console.error('❌ Email error FULL:', error);
    return false;
  }
};

module.exports = { sendEmail };
