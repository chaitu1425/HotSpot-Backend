import express from "express"
import isAuth from "../middleware/isAuth.js"
import { placeorder } from "../controller/ordercontroller.js"


const orderRouter = express.Router()

orderRouter.post('/placeorder',isAuth,placeorder)




export default orderRouter