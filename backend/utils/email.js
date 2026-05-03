const nodemailer = require('nodemailer');

const createTransporter = () => {
  const port = parseInt(process.env.EMAIL_PORT) || 465;
  const secure = port === 465; // true=SSL(465), false=STARTTLS(587)

  console.log(`📧 Creating SMTP transport: ${process.env.EMAIL_HOST}:${port} secure=${secure}`);

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port,
    secure,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 12000,
    greetingTimeout: 12000,
    socketTimeout: 15000
  });
};

// ── HTML base layout ──────────────────────────────────────────────────────────
const layout = (body) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>TaskFlow</title>
</head>
<body style="margin:0;padding:24px 12px;background:#060b18;font-family:'Segoe UI',Helvetica,Arial,sans-serif">
  <div style="max-width:560px;margin:0 auto">

    <!-- Logo bar -->
    <div style="text-align:center;margin-bottom:24px">
      <div style="display:inline-flex;align-items:center;gap:10px;background:rgba(99,102,241,0.12);border:1px solid rgba(99,102,241,0.25);padding:10px 22px;border-radius:50px">
        <span style="font-size:20px">⚡</span>
        <span style="color:#a5b4fc;font-size:17px;font-weight:700;letter-spacing:-0.3px">TaskFlow</span>
      </div>
    </div>

    <!-- Card -->
    <div style="background:#0f172a;border-radius:20px;overflow:hidden;border:1px solid rgba(99,102,241,0.15);box-shadow:0 25px 60px rgba(0,0,0,0.6)">

      <!-- Gradient header strip -->
      <div style="height:4px;background:linear-gradient(90deg,#6366f1,#8b5cf6,#a855f7,#ec4899)"></div>

      <!-- Content -->
      <div style="padding:40px 36px">
        ${body}
      </div>

      <!-- Footer -->
      <div style="padding:18px 36px;background:rgba(0,0,0,0.2);border-top:1px solid rgba(255,255,255,0.04)">
        <p style="color:#334155;font-size:11px;margin:0;text-align:center;line-height:1.6">
          © 2024 TaskFlow · This email was sent because you have an account.<br/>
          <a href="${process.env.CLIENT_URL}" style="color:#4f46e5;text-decoration:none">Visit TaskFlow</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;

// Helpers
const H = (t) => `<h2 style="color:#e2e8f0;font-size:22px;font-weight:700;margin:0 0 10px;letter-spacing:-0.4px">${t}</h2>`;
const P = (t) => `<p style="color:#94a3b8;font-size:14px;line-height:1.75;margin:0 0 16px">${t}</p>`;
const Box = (t) => `<div style="background:#1e293b;border-radius:12px;padding:20px 22px;margin:20px 0;border-left:3px solid #6366f1">${t}</div>`;
const Btn = (url, text, bg = 'linear-gradient(135deg,#6366f1,#8b5cf6)') =>
  `<a href="${url}" style="display:inline-block;background:${bg};color:#fff;padding:13px 28px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;letter-spacing:0.2px;margin-top:4px">${text}</a>`;
const Tag = (text, bg, color) =>
  `<span style="display:inline-block;background:${bg};color:${color};padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;text-transform:capitalize">${text}</span>`;

// ── Templates ─────────────────────────────────────────────────────────────────
const templates = {

  welcome: (name) => ({
    subject: '⚡ Welcome to TaskFlow!',
    html: layout(`
      ${H(`Welcome, ${name}! 👋`)}
      ${P('Your TaskFlow account is live. Start managing your team\'s work in one beautiful workspace.')}
      ${Box(`
        <p style="color:#a5b4fc;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin:0 0 12px">Quick Start</p>
        <p style="color:#94a3b8;font-size:13px;margin:5px 0">📁 &nbsp;Create your first project</p>
        <p style="color:#94a3b8;font-size:13px;margin:5px 0">👥 &nbsp;Invite your team members</p>
        <p style="color:#94a3b8;font-size:13px;margin:5px 0">✅ &nbsp;Assign & track tasks</p>
      `)}
      ${Btn(process.env.CLIENT_URL + '/dashboard', 'Open Dashboard →')}
    `)
  }),

  taskAssigned: (assigneeName, taskTitle, projectName, assignerName, dueDate) => ({
    subject: `📋 New task: "${taskTitle}"`,
    html: layout(`
      ${H('New Task Assigned')}
      ${P(`Hi <strong style="color:#e2e8f0">${assigneeName}</strong>, <strong style="color:#c4b5fd">${assignerName}</strong> has assigned you a task.`)}
      ${Box(`
        <p style="color:#e2e8f0;font-weight:700;font-size:16px;margin:0 0 10px;line-height:1.4">${taskTitle}</p>
        <p style="color:#64748b;font-size:13px;margin:4px 0">
          📁 &nbsp;<span style="color:#a5b4fc">${projectName}</span>
        </p>
        ${dueDate ? `<p style="color:#64748b;font-size:13px;margin:4px 0">
          📅 &nbsp;Due <span style="color:#fbbf24;font-weight:600">${new Date(dueDate).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'})}</span>
        </p>` : ''}
      `)}
      ${Btn(process.env.CLIENT_URL + '/tasks', 'View Task →')}
    `)
  }),

  taskUpdated: (userName, taskTitle, oldStatus, newStatus) => {
    const colors = {
      todo:          ['rgba(148,163,184,0.15)', '#94a3b8'],
      'in-progress': ['rgba(96,165,250,0.15)',  '#60a5fa'],
      review:        ['rgba(192,132,252,0.15)', '#c084fc'],
      done:          ['rgba(52,211,153,0.15)',  '#34d399']
    };
    const [oldBg, oldC] = colors[oldStatus] || colors.todo;
    const [newBg, newC] = colors[newStatus] || colors.todo;
    return {
      subject: `🔄 Task updated: "${taskTitle}"`,
      html: layout(`
        ${H('Task Status Updated')}
        ${P(`Hi <strong style="color:#e2e8f0">${userName}</strong>, a task you're involved in has been updated.`)}
        ${Box(`
          <p style="color:#e2e8f0;font-weight:600;font-size:15px;margin:0 0 14px;line-height:1.4">${taskTitle}</p>
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
            ${Tag(oldStatus.replace('-',' '), oldBg, oldC)}
            <span style="color:#6366f1;font-size:20px;font-weight:300">→</span>
            ${Tag(newStatus.replace('-',' '), newBg, newC)}
          </div>
        `)}
        ${Btn(process.env.CLIENT_URL + '/tasks', 'Open Task →')}
      `)
    };
  },

  projectInvite: (userName, projectName, inviterName) => ({
    subject: `🎯 Added to project: "${projectName}"`,
    html: layout(`
      ${H('Project Invitation')}
      ${P(`Hi <strong style="color:#e2e8f0">${userName}</strong>, <strong style="color:#c4b5fd">${inviterName}</strong> has added you to a project.`)}
      ${Box(`
        <p style="color:#64748b;font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;margin:0 0 6px">Project</p>
        <p style="color:#e2e8f0;font-size:20px;font-weight:700;margin:0">${projectName}</p>
      `)}
      ${P('You can now view all tasks, collaborate with the team, and contribute to the project.')}
      ${Btn(process.env.CLIENT_URL + '/projects', 'Open Project →')}
    `)
  }),

  passwordReset: (name, resetUrl) => ({
    subject: '🔐 Reset your TaskFlow password',
    html: layout(`
      ${H('Password Reset')}
      ${P(`Hi <strong style="color:#e2e8f0">${name}</strong>, we received a request to reset your password.`)}
      ${P('This link expires in <strong style="color:#fbbf24">1 hour</strong>. If you didn\'t request this, ignore this email.')}
      ${Btn(resetUrl, 'Reset Password →', 'linear-gradient(135deg,#ef4444,#dc2626)')}
      ${Box(`<p style="color:#475569;font-size:12px;margin:0;line-height:1.6">
        🔒 &nbsp;Your password will not change until you click the link above and set a new one.
      </p>`)}
    `)
  })
};

// ── Main send function ────────────────────────────────────────────────────────
const sendEmail = async (to, templateName, ...args) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn(`⚠️  Email skipped [${templateName}] — EMAIL_USER/PASS not configured`);
    return false;
  }

  try {
    const transporter = createTransporter();
    const tpl = templates[templateName];
    if (!tpl) { console.error(`❌ Unknown template: ${templateName}`); return false; }

    const { subject, html } = tpl(...args);
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `TaskFlow <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });

    console.log(`✉️  Sent [${templateName}] → ${to} (id: ${info.messageId})`);
    return true;
  } catch (err) {
    console.error(`❌ Email failed [${templateName}] → ${to} | ${err.code}: ${err.message}`);
    if (err.code === 'EAUTH')
      console.error('   Fix: Use Gmail App Password (myaccount.google.com/apppasswords), not your login password');
    if (err.code === 'ECONNECTION' || err.code === 'ETIMEDOUT')
      console.error('   Fix: Change EMAIL_PORT=465 in Render env vars (port 587 is blocked on Render)');
    return false; // Never crash the app over email
  }
};

module.exports = { sendEmail };
