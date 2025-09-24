import express from "express"
import isAuth from "../middleware/isAuth.js"
import { acceptOrder, getCurrentOrder, getDeliveryBoyAssignment, getMyOrders, getOrderById, placeorder, sendDeliveryOtp, updateOrderStatus, verifyDeliveryOTP, verifyPayment } from "../controller/ordercontroller.js"



const orderRouter = express.Router()

orderRouter.post('/placeorder',isAuth,placeorder)
orderRouter.post('/verify-payment',isAuth,verifyPayment)
orderRouter.get('/my-orders',isAuth,getMyOrders)
orderRouter.post('/update-status/:orderId/:shopId',isAuth,updateOrderStatus)

orderRouter.get('/get-assignments',isAuth,getDeliveryBoyAssignment)

orderRouter.get('/accept-order/:assignmentId',isAuth,acceptOrder)
orderRouter.get('/get-current-order',isAuth,getCurrentOrder)
orderRouter.get('/get-order-by-id/:orderId',isAuth,getOrderById)

orderRouter.post('/send-delivery-otp',isAuth,sendDeliveryOtp)
orderRouter.post('/verify-delivery-otp',isAuth,verifyDeliveryOTP)




export default orderRouter