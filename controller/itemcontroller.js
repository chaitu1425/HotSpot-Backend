import Item from "../model/itemsModel";
import Shop from "../model/shopmodel";
import uploadonCloudinary from "../utils/cloudinary";

export const addItems = async(req,res)=>{
    try {
        const {name,category,foodType,price} = req.body
        let image;
        if(req.file){
            image=await uploadonCloudinary(req.file.path)
        }
        const shop = await Shop.findOne({owner:req.userId})
        if(!shop){
            return res.status(400).json({message:"shop not found"})
        }
        const item = await Item.create({
            name,
            category,
            foodType,
            price,
            image,
            shop:shop_id
        })

        return res.status(201).json(item)
    } catch (error) {
        return res.status(500).json({message:`Create item error ${error}`})
        
    }
}

export const editItem = async(req,res)=>{
    try{
        const itemId = req.params.itemsId
        const {name,category,foodType,price} = req.body
        let image;
        if(req.file){
            image=await uploadonCloudinary(req.file.path)
        }
        const item =await Item.findByIdAndUpdate(itemId,{name,category,foodType,price,image},{new:true})
        if(!item){
            return res.status(400).json({message:"item not found"})
        }
        return res.status(201).json(item)
    }catch(error){
        return res.status(500).json({message:`Edit item error ${error}`})
    }
}