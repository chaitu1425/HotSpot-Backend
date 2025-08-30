import express from "express"
import { signIn, signOut, signUp } from "../controller/authcontroller.js"

const authRouter =  express.Router()

authRouter.route('/signup',signUp)
authRouter.route('/signin',signIn)
authRouter.route('/signout',signOut)

export default authRouter