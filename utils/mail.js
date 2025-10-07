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

export const SendOTPMail = async (to, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL,
    to,
    subject: "Reset Your Password",
    html: `<p>Your OTP for password reset is <b>${otp}</b>.It expires in 5 minutes.</p>`
  })
}

export const sendDeliveryOTP = async (user, otp) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: user.email,
      subject: "Delivery Confirmation OTP",
      html: `<p>Share this OTP to our delivery boy <b>${otp}</b>.It expires in 5 minutes.</p>`
    })
  } catch (error) {
    console.log("send delivery opt error", error)
  }
}