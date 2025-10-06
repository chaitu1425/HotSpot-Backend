import User from "../model/usermodel.js"
import bcrypt from "bcrypt"
import gentoken from "../utils/token.js"
import { SendOTPMail } from "../utils/mail.js"


export const signUp = async (req, res) => {
    try {
        const {fullname,email,password,mobile, role } = req.body
        let user = await User.findOne({ email })
        if(user) {
            return res.status(400).json({ message: "User already exists." })
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" })
        }
        if (mobile.length < 10) {
            return res.status(400).json({ message: "Mobile no must be atleast 10 digits" })
        }
        const hashedpassword = await bcrypt.hash(password, 10);
        user = await User.create({
            fullname,
            email,
            password: hashedpassword,
            role,
            mobile
        })

        const token = await gentoken(user._id)
        res.cookie("token", token, {
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true
        })
        return res.status(201).json(user)

    } catch (error) {
        return res.status(500).json(`Signup error ${error}`)
    }
}

export const signIn = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "User Not Found" })
        }

        const ismatch = await bcrypt.compare(password, user.password)
        if (!ismatch) {
            return res.status(400).json({ message: "Incorrect password" })
        }

        const token = await gentoken(user._id)
        res.cookie("token", token, {
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true
        })
        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json(`Sign in error ${error}`)
    }
}

export const signOut = async(req,res)=>{
    try {
        await res.clearCookie("token")
        res.status(201).json({message:"Logout Successfull"})
    } catch (error) {
        return res.status(500).json(`Sign out error ${error}`)        
    }
}

export const SendOtp = async(req,res)=>{
    try {
        const {email} = req.body
        const user = await User.findOne({email})
        if(!user){
           return res.status(400).json({message:'User does not exist'})
        }
        const otp = Math.floor(1000+Math.random()*9000).toString()
        user.resetOtp=otp
        user.otpExpires=Date.now()+5*60*1000
        user.isOtpVerified=false
        await user.save()
        await SendOTPMail(email,otp)
        return res.status(200).json({message:'otp sent successful'})
    } catch (error) {
        return res.status(500).json(`send otp error ${error}`)
    }
}

export const verifyOTP = async(req,res)=>{
    try {
        const {email,otp} = req.body
        const user = await User.findOne({email})
        if(!user || user.resetOtp != otp || user.otpExpires<Date.now()){
            return res.status(400).json({message:"invalid/expired OTP"})
        }
        user.isOtpVerified=true
        user.resetOtp=undefined
        user.otpExpires=undefined
        await user.save()
        return res.status(200).json({message:'otp verified successfully'})
    } catch (error) {
        return res.status(500).json(`Verify otp error ${error}`)
    }
}

export const resetPassword = async(req,res)=>{
    try {
        const {email,newPass} = req.body
        if(newPass.empty()){
            return res.status(400).json({message:'Password required'})
        }
        if(newPass<6){
            return res.status(400).json({message:'Password must be at least 6 char'})
        }
        const user = await User.findOne({email})
        if(!user || !user.isOtpVerified){
           return res.status(400).json({message:'OTP Verifcation Required'})
        }
        const hashedpassword = await bcrypt.hash(newPass,10)
        user.password=hashedpassword
        user.isOtpVerified=false
        await user.save()
        return res.status(200).json({message:'Password reset successfully'})
    } catch (error) {
        return res.status(500).json(`Password Reset error ${error}`)
        
    }
}

export const googleAuth = async(req,res)=>{
    try{
        const {fullname,email,mobile,role}=req.body
        let user = await User.findOne({email})
        if(!user){
            user = await User.create({
                fullname,
                email,
                mobile,
                role
            })
        }
        const token =await gentoken(user._id) 
        res.cookie("token",token,{
            secure:true,
            sameSite:"none",
            maxAge:7*24*60*60*1000,
            httpOnly:true
        })
        return res.status(200).json(user)
    }catch(error){
        return res.status(500).json(`Google Signup error ${error}`)
    }
}