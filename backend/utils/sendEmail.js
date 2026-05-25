const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendWelcomeEmail = async ({ name, email, role, course, batch, enrollmentNo }) => {
  const isStudent = role === 'student';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Welcome to Universal CodeBox</title>
    </head>
    <body style="margin:0;padding:0;background:#0f0f1a;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f1a;padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#1a1a2e;border-radius:20px;overflow:hidden;border:1px solid rgba(102,126,234,0.3);">
              
              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#667eea,#764ba2);padding:40px;text-align:center;">
                  <div style="font-size:2.5rem;margin-bottom:10px;">⚡</div>
                  <h1 style="color:#fff;margin:0;font-size:1.8rem;font-weight:700;">Universal CodeBox</h1>
                  <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;">Your Learning Portal</p>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:40px;">
                  <h2 style="color:#fff;font-size:1.4rem;margin:0 0 10px;">
                    Welcome aboard, ${name}! 🎉
                  </h2>
                  <p style="color:#a0a0b0;line-height:1.7;margin:0 0 25px;">
                    Your account has been successfully created on <strong style="color:#667eea;">Universal CodeBox</strong>. 
                    You're now part of our learning community as a <strong style="color:#667eea;text-transform:capitalize;">${role}</strong>.
                  </p>

                  <!-- Account Details Card -->
                  <div style="background:rgba(102,126,234,0.08);border:1px solid rgba(102,126,234,0.25);border-radius:14px;padding:24px;margin-bottom:28px;">
                    <h3 style="color:#667eea;margin:0 0 16px;font-size:0.95rem;text-transform:uppercase;letter-spacing:1px;">
                      Account Details
                    </h3>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:6px 0;color:#a0a0b0;font-size:0.9rem;width:140px;">Full Name</td>
                        <td style="padding:6px 0;color:#fff;font-size:0.9rem;font-weight:600;">${name}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;color:#a0a0b0;font-size:0.9rem;">Email</td>
                        <td style="padding:6px 0;color:#fff;font-size:0.9rem;font-weight:600;">${email}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;color:#a0a0b0;font-size:0.9rem;">Role</td>
                        <td style="padding:6px 0;font-size:0.9rem;font-weight:600;text-transform:capitalize;">
                          <span style="background:rgba(102,126,234,0.2);color:#667eea;padding:3px 10px;border-radius:20px;">${role}</span>
                        </td>
                      </tr>
                      ${isStudent && course ? `
                      <tr>
                        <td style="padding:6px 0;color:#a0a0b0;font-size:0.9rem;">Course</td>
                        <td style="padding:6px 0;color:#fff;font-size:0.9rem;font-weight:600;">${course}</td>
                      </tr>` : ''}
                      ${isStudent && batch ? `
                      <tr>
                        <td style="padding:6px 0;color:#a0a0b0;font-size:0.9rem;">Batch</td>
                        <td style="padding:6px 0;color:#fff;font-size:0.9rem;font-weight:600;">${batch}</td>
                      </tr>` : ''}
                      ${isStudent && enrollmentNo ? `
                      <tr>
                        <td style="padding:6px 0;color:#a0a0b0;font-size:0.9rem;">Enrollment No.</td>
                        <td style="padding:6px 0;color:#fff;font-size:0.9rem;font-weight:600;">${enrollmentNo}</td>
                      </tr>` : ''}
                    </table>
                  </div>

                  <!-- What you can do -->
                  <h3 style="color:#fff;font-size:1rem;margin:0 0 14px;">
                    ${isStudent ? '📚 What you can do as a Student' : '🎓 What you can do as a Teacher'}
                  </h3>
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                    ${isStudent ? `
                    <tr><td style="padding:5px 0;color:#a0a0b0;font-size:0.88rem;">✅ &nbsp; Submit assignments and track your progress</td></tr>
                    <tr><td style="padding:5px 0;color:#a0a0b0;font-size:0.88rem;">✅ &nbsp; Take exams and view your scores</td></tr>
                    <tr><td style="padding:5px 0;color:#a0a0b0;font-size:0.88rem;">✅ &nbsp; View marks and performance reports</td></tr>
                    <tr><td style="padding:5px 0;color:#a0a0b0;font-size:0.88rem;">✅ &nbsp; Access all course materials</td></tr>
                    ` : `
                    <tr><td style="padding:5px 0;color:#a0a0b0;font-size:0.88rem;">✅ &nbsp; Create and manage assignments</td></tr>
                    <tr><td style="padding:5px 0;color:#a0a0b0;font-size:0.88rem;">✅ &nbsp; Create and schedule exams</td></tr>
                    <tr><td style="padding:5px 0;color:#a0a0b0;font-size:0.88rem;">✅ &nbsp; Grade student submissions</td></tr>
                    <tr><td style="padding:5px 0;color:#a0a0b0;font-size:0.88rem;">✅ &nbsp; Manage and monitor students</td></tr>
                    `}
                  </table>

                  <!-- CTA Button -->
                  <div style="text-align:center;margin-bottom:28px;">
                    <a href="http://localhost:3000/login"
                      style="display:inline-block;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;text-decoration:none;padding:14px 36px;border-radius:12px;font-weight:700;font-size:1rem;letter-spacing:0.5px;">
                      Go to Dashboard →
                    </a>
                  </div>

                  <p style="color:#a0a0b0;font-size:0.82rem;line-height:1.6;margin:0;">
                    ⚠️ If you did not create this account, please ignore this email or contact support immediately.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background:rgba(0,0,0,0.3);padding:20px;text-align:center;border-top:1px solid rgba(102,126,234,0.15);">
                  <p style="color:#606080;font-size:0.8rem;margin:0;">
                    © ${new Date().getFullYear()} Universal CodeBox. All rights reserved.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"Universal CodeBox" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🎉 Welcome to Universal CodeBox – Account Created Successfully',
    html: htmlContent,
  });
};

module.exports = sendWelcomeEmail;