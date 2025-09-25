import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String
    },
    mobile: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["user", "owner", "deliveryboy"],
        required: true
    },
    resetOtp: {
        type: String
    },
    isOtpVerified: {
        type: Boolean,
        default: false
    },
    otpExpires: {
        type: Date
    },
    location: {
        type: {
            type:String,
            enum:['Point'],
            default: 'Point'
        },
        coordinates: {
            type:[Number],
            default:[0,0]
        }
    },
    socketId:{
        type:String
    },
    isOnline:{
        type:Boolean,
        default:false
    }
}, { timestamps: true })

userSchema.index({ location:'2dsphere'})

const User = mongoose.model("User", userSchema)
export default User
