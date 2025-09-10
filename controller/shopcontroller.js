import Shop from "../model/shopmodel.js"
import uploadonCloudinary from "../utils/cloudinary.js"

export const createShop = async(req,res)=>{
    try {
        const {name,city,state,address} = req.body
        let image
        if(req.file){
            console.log(req.file)
            image = await uploadonCloudinary(req.file.path)            
        }
        let shop = await Shop.findOne({owner:req.userId})
        if(!shop){
            shop = await Shop.create({
                name,
                city,
                state,
                address,
                image,
                owner:req.userId
            })
        }else{
            shop = await Shop.findByIdAndUpdate(shop._id,{
                name,
                city,
                state,
                address,
                image,
                owner:req.userId
            },{new:true})
        }
        await shop.populate("owner items")
        return res.status(201).json(shop)
    } catch (error) {
        return res.status(500).json({message:`Create shop error ${error}`})
    }
}

export const getShop = async(req,res)=>{
    try {
        const shop = await Shop.findOne({owner:req.userId}).populate("owner").populate({
            path:"items",
            options:{sort:{updatedAt:-1}}
        })
        if(!shop){
            return null;
        }
        return res.status(200).json(shop)
    } catch (error) {
        return res.status(500).json({message:`Get shop error ${error}`})
    }
}

export const getShopByCity = async(req,res)=>{
    try {
        const {city} = req.params
        const shop = await Shop.find({
            city:{$regex : new RegExp(`^${city}$`,"i")}
        }).populate('items')
        if(!shop){
            return res.status(400).json({message:"Shop not Found"})
        }
        return res.status(200).json(shop)
    } catch (error) {
        return res.status(500).json({message:`Get shop by city error ${error}`})
    }
}