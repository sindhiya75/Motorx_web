const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Send 2-Step Authentication Password Reset Email
 */
const sendPasswordResetOtp = async (toEmail, adminName, otpCode) => {
  const hasSmtp = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

  console.log('---------------------------------------------------------');
  console.log(`🔐 [MOTORX 2-STEP AUTHENTICATION] Password Reset Code`);
  console.log(`📧 Recipient: ${toEmail} (${adminName})`);
  console.log(`🔢 6-Digit OTP Code: ${otpCode}`);
  console.log(`⏱️  Valid for: 10 minutes`);
  console.log('---------------------------------------------------------');

  if (hasSmtp) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      const mailOptions = {
        from: process.env.SMTP_FROM || `"MOTORX Security" <${process.env.SMTP_USER}>`,
        to: toEmail,
        subject: `MOTORX Admin 2-Step Verification Code: ${otpCode}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h2 style="color: #062B5C; margin: 0; font-size: 24px; font-weight: 800;">MOTORX</h2>
              <span style="font-size: 11px; color: #0756B8; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Admin Security Center</span>
            </div>
            
            <p style="font-size: 14px; color: #334155; line-height: 1.6;">
              Hello <strong>${adminName}</strong>,
            </p>
            <p style="font-size: 14px; color: #334155; line-height: 1.6;">
              A request was received to reset the password for your administrator account. Use the following 2-Step verification code to authorize this request:
            </p>
            
            <div style="text-align: center; margin: 28px 0;">
              <div style="display: inline-block; padding: 14px 32px; background-color: #F5FAFF; border: 2px dashed #0756B8; border-radius: 12px; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #062B5C; font-family: monospace;">
                ${otpCode}
              </div>
              <div style="margin-top: 8px; font-size: 12px; color: #64748B;">This verification code expires in 10 minutes.</div>
            </div>

            <p style="font-size: 12px; color: #64748B; line-height: 1.5; border-top: 1px solid #f1f5f9; padding-top: 16px;">
              If you did not request a password reset, please ignore this email or notify the security team immediately.
            </p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`✅ [MOTORX] 2FA Reset Email dispatched via SMTP to ${toEmail}`);
    } catch (mailErr) {
      console.warn(`⚠️ [MOTORX] SMTP send failed: ${mailErr.message}. Code logged above.`);
    }
  }

  return {
    success: true,
    codePreview: process.env.NODE_ENV !== 'production' ? otpCode : undefined
  };
};

module.exports = {
  sendPasswordResetOtp
};
