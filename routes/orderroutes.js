import express from "express"
import isAuth from "../middleware/isAuth.js"
import { getMyOrders, placeorder } from "../controller/ordercontroller.js"


const orderRouter = express.Router()

orderRouter.post('/placeorder',isAuth,placeorder)
orderRouter.get('/my-orders',isAuth,getMyOrders)




export default orderRouter