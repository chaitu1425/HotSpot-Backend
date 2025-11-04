import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

const transporter = nodemailer.createTransport({
  service: "Gmail",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  }
});

transporter.verify((err, success) => {
  if (err) {
    console.error('Email transporter verification failed:', err);
  } else {
    console.log('Email transporter is ready to send messages');
  }
});

export const SendOTPMail = async (to, otp) => {
  try{
    const info = await transporter.sendMail({
    from: process.env.EMAIL,
    to,
    subject: "Reset Your Password",
    html: `<p>Your OTP for password reset is <b>${otp}</b>.It expires in 5 minutes.</p>`
  })
  console.log(`OTP email sent to ${to}: ${info.messageId}`);
  return info;
  }catch(err){
    console.error('SendOTPMail error:', error);
    throw err;
  } 
}

export const sendDeliveryOTP = async (user, otp) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL,
      to: user.email,
      subject: "Delivery Confirmation OTP",
      html: `<p>Share this OTP to our delivery boy <b>${otp}</b>. It expires in 5 minutes.</p>`
    });
    console.log(`Delivery OTP sent to ${user.email}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.log("send delivery otp error", error)
    throw error;
  }
}