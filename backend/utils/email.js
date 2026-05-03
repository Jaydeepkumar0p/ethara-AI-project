const nodemailer = require('nodemailer');

const createTransport = () => nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 5000,
  greetingTimeout: 5000,
  socketTimeout: 5000
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
            You've successfully joined TaskFlow. Start managing your team's tasks with ease, 
            track progress in real-time, and never miss a deadline again.
          </p>
          <div style="background:#1e293b;border-radius:8px;padding:20px;margin:24px 0">
            <h3 style="color:#a5b4fc;margin-top:0">Getting Started:</h3>
            <ul style="color:#94a3b8;line-height:2">
              <li>Create your first project</li>
              <li>Invite team members</li>
              <li>Assign tasks and track progress</li>
            </ul>
          </div>
          <a href="${process.env.CLIENT_URL}/login" 
             style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600">
            Go to Dashboard →
          </a>
        </div>
        <div style="padding:20px;text-align:center;border-top:1px solid #1e293b">
          <p style="color:#475569;font-size:12px;margin:0">© 2024 TaskFlow. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  taskAssigned: (assigneeName, taskTitle, projectName, assignerName, dueDate) => ({
    subject: `📋 New Task Assigned: ${taskTitle}`,
    html: `
      <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:auto;background:#0f172a;color:#e2e8f0;border-radius:12px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:30px;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:24px">⚡ TaskFlow</h1>
        </div>
        <div style="padding:40px">
          <h2 style="color:#a5b4fc">New Task Assigned to You</h2>
          <p style="color:#94a3b8">Hi ${assigneeName}, <strong style="color:#e2e8f0">${assignerName}</strong> has assigned you a new task.</p>
          <div style="background:#1e293b;border-radius:8px;padding:24px;margin:24px 0;border-left:4px solid #6366f1">
            <h3 style="color:#fff;margin:0 0 8px">${taskTitle}</h3>
            <p style="color:#94a3b8;margin:0 0 8px">Project: <span style="color:#a5b4fc">${projectName}</span></p>
            ${dueDate ? `<p style="color:#94a3b8;margin:0">Due: <span style="color:#f59e0b">${new Date(dueDate).toLocaleDateString()}</span></p>` : ''}
          </div>
          <a href="${process.env.CLIENT_URL}/tasks" 
             style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600">
            View Task →
          </a>
        </div>
      </div>
    `
  }),

  taskUpdated: (userName, taskTitle, oldStatus, newStatus) => ({
    subject: `🔄 Task Status Updated: ${taskTitle}`,
    html: `
      <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:auto;background:#0f172a;color:#e2e8f0;border-radius:12px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:30px;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:24px">⚡ TaskFlow</h1>
        </div>
        <div style="padding:40px">
          <h2 style="color:#a5b4fc">Task Status Updated</h2>
          <p style="color:#94a3b8">Hi ${userName},</p>
          <div style="background:#1e293b;border-radius:8px;padding:24px;margin:24px 0">
            <h3 style="color:#fff;margin:0 0 16px">${taskTitle}</h3>
            <div style="display:flex;align-items:center;gap:12px">
              <span style="background:#374151;color:#9ca3af;padding:4px 12px;border-radius:20px;font-size:13px">${oldStatus}</span>
              <span style="color:#6366f1">→</span>
              <span style="background:#1d4ed8;color:#93c5fd;padding:4px 12px;border-radius:20px;font-size:13px">${newStatus}</span>
            </div>
          </div>
          <a href="${process.env.CLIENT_URL}/tasks" 
             style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600">
            View Task →
          </a>
        </div>
      </div>
    `
  }),

  projectInvite: (userName, projectName, inviterName) => ({
    subject: `🎯 You've been added to project: ${projectName}`,
    html: `
      <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:auto;background:#0f172a;color:#e2e8f0;border-radius:12px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:30px;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:24px">⚡ TaskFlow</h1>
        </div>
        <div style="padding:40px">
          <h2 style="color:#a5b4fc">Project Invitation</h2>
          <p style="color:#94a3b8">Hi ${userName}, <strong style="color:#e2e8f0">${inviterName}</strong> has added you to a project.</p>
          <div style="background:#1e293b;border-radius:8px;padding:24px;margin:24px 0;border-left:4px solid #8b5cf6">
            <h3 style="color:#fff;margin:0">${projectName}</h3>
          </div>
          <a href="${process.env.CLIENT_URL}/projects" 
             style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600">
            View Project →
          </a>
        </div>
      </div>
    `
  }),

  passwordReset: (name, resetUrl) => ({
    subject: '🔐 Password Reset Request',
    html: `
      <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:auto;background:#0f172a;color:#e2e8f0;border-radius:12px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:30px;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:24px">⚡ TaskFlow</h1>
        </div>
        <div style="padding:40px">
          <h2 style="color:#a5b4fc">Password Reset</h2>
          <p style="color:#94a3b8">Hi ${name}, you requested a password reset. Click the button below (valid for 1 hour):</p>
          <a href="${resetUrl}" 
             style="display:inline-block;background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;margin:20px 0">
            Reset Password →
          </a>
          <p style="color:#475569;font-size:12px">If you didn't request this, please ignore this email.</p>
        </div>
      </div>
    `
  })
};

const sendEmail = async (to, templateName, ...args) => {
  try {
    const transport = createTransport();
    const template = emailTemplates[templateName](...args);

    await transport.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: template.subject,
      html: template.html
    });

    console.log(`✉️ Email sent: ${templateName} → ${to}`);
    return true;
  } catch (error) {
    console.error('❌ Email error:', error.message);
    return false;
  }
};

module.exports = { sendEmail };
