import User from "../model/usermodel.js"
import bcrypt from "bcrypt"
import gentoken from "../utils/token.js"


export const signUp = async (req, res) => {
    try {
        const { fullname, email, password, mobile, role } = req.body
        const user = await User.find({ email })
        if (user) {
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
            secure: false,
            sameSite: "strict",
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
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true
        })
        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json(`Sign in error ${error}`)
    }
}

export const signOut = async(params)=>{
    try {
        res.clearCookie("token")
        return res.status(200).json({message:"Logout Successfull"})
    } catch (error) {
        return res.status(500).json(`Sign out error ${error}`)        
    }
}