import express from "express"
import { resetPassword, SendOtp, signIn, signOut, signUp, verifyOTP } from "../controller/authcontroller.js"

const authRouter =  express.Router()

authRouter.post('/signup',signUp)
authRouter.post('/signin',signIn)
authRouter.get('/signout',signOut)

authRouter.post('/sendotp',SendOtp)
authRouter.post('/verifyotp',verifyOTP)
authRouter.post('/resetpass',resetPassword)



export default authRouter