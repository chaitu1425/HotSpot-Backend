import express from "express"
import isAuth from "../middleware/isAuth.js"
import { getDeliveryBoyAssignment, getMyOrders, placeorder, updateOrderStatus } from "../controller/ordercontroller.js"


const orderRouter = express.Router()

orderRouter.post('/placeorder',isAuth,placeorder)
orderRouter.get('/my-orders',isAuth,getMyOrders)
orderRouter.post('/update-status/:orderId/:shopId',isAuth,updateOrderStatus)

orderRouter.get('/get-assignments',isAuth,getDeliveryBoyAssignment)





export default orderRouter