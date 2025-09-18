import mongoose from "mongoose";
import { type } from "os";

const shopOrderItemSchema = new mongoose.Schema({
    item:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Item",
        required:true
    },
    name:String,
    price:Number,
    quantity:Number
},{timestamps:true})

const shopOrderSchema = new mongoose.Schema({
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop"
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    subtotal:Number,
    shopOrderItems:[shopOrderItemSchema],
    status:{
        type:String,
        enumm:['pending','preparing','out for delivery','   '],
        default:'pending'
    }

},{ timestamps: true })

const orderScheme = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    paymentMethod: {
        type: String,
        enum: ['cod', 'online'],
        required: true
    },
    deliveryAddress: {
        text: String,
        latitude: Number,
        longitude: Number
    },
    totalAmount: {
        type: Number
    },
    shopOrders: [shopOrderSchema]

}, { timestamps: true })

const Order = mongoose.model("Order",orderScheme)
export default Order 