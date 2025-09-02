import express from "express"
import { googleAuth, resetPassword, SendOtp, signIn, signOut, signUp, verifyOTP } from "../controller/authcontroller.js"

const authRouter =  express.Router()

authRouter.post('/signup',signUp)
authRouter.post('/signin',signIn)
authRouter.get('/signout',signOut)

authRouter.post('/sendotp',SendOtp)
authRouter.post('/verifyotp',verifyOTP)
authRouter.post('/resetpass',resetPassword)
authRouter.post('/google-auth',googleAuth)


export default authRouter