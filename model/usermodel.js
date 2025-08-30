import mongoose from "mongoose"

const userSchema =new mongoose.Schema({
    fullname:{
        type:String,
        required:true
    },
    email:{
        type:String,
        unique:true,
        required:true
    },
    password:{
        type:String
    },
    mobile:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:["user","owner","deliveryboy"],
        required:true
    }
},{timestamps:true})


const User = mongoose.model("User",userSchema)

export default User