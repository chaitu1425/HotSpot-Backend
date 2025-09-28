import Item from "../model/itemsModel.js"
import User from "../model/usermodel.js"
import Order from "../model/ordermodel.js"

export const getCurrentUser = async(req,res)=>{
    try {
        const userId = req.userId
        if(!userId){
            return res.status(400).json({message:'userId not Found'})
        }
        const user = await User.findById(userId)
        if(!user){
            return res.status(400).json({message:'User not found'})
        }
        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({message:`get current user ${error}`})
    }
}

export const updateUserLocation = async(req,res)=>{
    try {
        const {lat,lon} = req.body
        const user = await User.findByIdAndUpdate(req.userId,{
            location:{
                type:'Point',
                coordinates:[lon,lat]
            }
        },{new:true})
        if(!user){
            return res.status(400).json({message:'User not found'})
        }
        return res.status(200).json({message:'location updated'})
    } catch (error) {
        return res.status(500).json({message:`update location error ${error}`})
    }
}

export const rating = async(req,res)=>{
    try {
        const {rating,itemId} = req.body
        if(!itemId || !rating)return res.status(400).json({message:'item id and rating required'})
        if(rating<1 || rating >5)return res.status(400).json({message:'invalid rating'})
        
        const item = await Item.findById(itemId)
        if(!item){
            return res.status(400).json({message:'Item not found'})
        }
        const newCount = item.rating.count+1;
        const newavg = (item.rating.average*item.rating.count+rating)/newCount;
        item.rating.count=newCount
        item.rating.average=newavg
        await item.save()
        return res.status(200).json({rating:item.rating})
    } catch (error) {
        return res.status(500).json({message:`rating error ${error}`})
    }
}