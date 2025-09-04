import Shop from "../model/shopmodel"
import uploadonCloudinary from "../utils/cloudinary"

export const createShop = async(req,res)=>{
    try {
        const {name,city,state,address} = req.body
        let image
        if(req.file){
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
            shop = await Shop.findByIdAndUpdate(shop._Id,{
                name,
                city,
                state,
                address,
                image,
                owner:req.userId
            },{new:true})
        }
        await shop.populate("owner")
        return res.status(201).json(shop)
    } catch (error) {
        return res.status(500).json({message:`Create shop error ${error}`})
    }
}

export const getShop = async(req,res)=>{
    try {
        const shop = await Shop.findById({owner:req.userId}).populate("owner items")
        if(!shop){
            return null;
        }
        return res.status(200).json(shop)
    } catch (error) {
        return res.status(500).json({message:`Get shop error ${error}`})
    }
}