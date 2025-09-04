import mongoose from "mongoose";
const shopSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    image:{
        tpe:String,
        required:true
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    city:{
        type:String,
        required:true
    },
    state:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    items:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Item"
    }]

},{timestamps:true})

const Shop = mongoose.model("Shop",shopSchema)

export default Shop