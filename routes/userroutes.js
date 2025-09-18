import express from "express"
import { getCurrentUser, updateUserLocation } from "../controller/usercontroller.js"
import isAuth from "../middleware/isAuth.js"

const userRouter = express.Router()

userRouter.get('/current',isAuth,getCurrentUser)
userRouter.post('/update-location',isAuth,updateUserLocation)


export default userRouter