import resend from "../config/resend.js";

const sendOTPEmail = async (to, otp) => {
  await resend.emails.send({
    from: "Store <onboarding@yourdomain.com>",
    to,
    subject: "رمز التحقق - Verify your account",
    html: `<h2>Your verification code is: ${otp}</h2><p>Expires in 10 minutes.</p>`,
  });
};

export default sendOTPEmail;