import mongoose from "mongoose";

const dbconnect = async()=>{
    try{
        await mongoose.connect(process.env.DBURL)
        console.log("Database Connected")
    }catch(error){
        console.log(error)
    }
}

export default dbconnect;