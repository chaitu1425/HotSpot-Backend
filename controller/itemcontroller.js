import Item from "../model/itemsModel.js";
import Shop from "../model/shopmodel.js";
import uploadonCloudinary from "../utils/cloudinary.js";

export const addItems = async(req,res)=>{
    try {
        const {name,category,foodType,price} = req.body
        let image;
        if(req.file){
            image=await uploadonCloudinary(req.file.path)
        }
        const shop = await Shop.findOne({ owner:req.userId })
        if(!shop){
            return res.status(400).json({message:"shop not found"})
        }
        const item = await Item.create({name, category, foodType, price, image, shop: shop._id
        })
        shop.items.push(item._id)
        await shop.save()
        await shop.populate("owner")
        await shop.populate({
            path:"items",
            options:{sort:{updatedAt:-1}}
        })
        return res.status(201).json(shop)

    } catch (error) {
        return res.status(500).json({message:`Add item error ${error}`})
        
    }
}

export const editItem = async(req,res)=>{
    try{
        const itemId = req.params.itemId
        const {name,category,foodType,price} = req.body
        let image;
        if(req.file){
            image=await uploadonCloudinary(req.file.path)
        }
        const item =await Item.findByIdAndUpdate(itemId,{name,category,foodType,price,image},{new:true})
        if(!item){
            return res.status(400).json({message:"item not found"})
        }
        const shop = await Shop.findOne({owner:req.userId}).populate({
            path:"items",
            options:{sort:{updatedAt:-1}}
        })
        return res.status(201).json(item)
    }catch(error){
        return res.status(500).json({message:`Edit item error ${error}`})
    }
}

export const deleteItem = async(req,res)=>{
    try {
        const itemId = req.params.itemId
        const item = await Item.findByIdAndDelete(itemId)
        if(!item){
            return res.status(400).json({message:"item not found"})
        }
        const shop = await Shop.findOne({owner:req.userId})
        shop.items = shop.items.filter(i=>i!==item._id)
        await shop.save()
        await shop.populate({
            path:"items",
            options:{sort:{updatedAt:-1}}
        })
        return res.status(201).json(shop)
    } catch (error) {
        return res.status(500).json({message:`delete item error ${error}`})
        
    }
}


export const GetItemByid = async(req,res)=>{
    try {
        const itemId = req.params.itemId
        const item = await Item.findById(itemId)
        if(!item){
            return res.status(400).json({message:"item not found"})
        }
        return res.status(200).json(item)
    } catch (error) {
        return res.status(500).json({message:` item error ${error}`})
    }
}

export const getItemByCity = async(req,res)=>{
    try {
        const {city} = req.params
        if(!city){
            return res.status(400).json({message:"city is required"})
        }
        const shop = await Shop.find({
            city:{$regex : new RegExp(`^${city}$`,"i")}
        }).populate('items')
        if(!shop){
            return res.status(400).json({message:"shop not found"})
        }
        const shopIds = shop.map((shop)=>shop._id)

        const item = await Item.find({shop:{$in:shopIds}})
        return res.status(200).json(item)
    } catch (error) {
        return res.status(500).json({message:`get item by city error ${error}`})

    }
}

export const getItemsByShop = async(req,res)=>{
    try {
        const {shopId} = req.params
        const shop = await Shop.findById(shopId).populate("items")
        if(!shop){
            return res.status(400).json({message:"Shop not found"})
        }
        return res.status(200).json({
            shop,items:shop.items
        })
    } catch (error) {
        return res.status(500).json({message:`get item by shop error ${error}`})
    }
}

export const searchItems = async(req,res)=>{
    try {
        const {query,city} = req.query
        if(!query || !city){
            return null
        }
        const shop = await Shop.find({
            city:{$regex : new RegExp(`^${city}$`,"i")}
        }).populate('items')
        if(!shop){
            return res.status(400).json({message:"Shop not Found"})
        }
        const shopId = shop.map(s=>s._id)
        const items =  await Item.find({
            shop:{$in:shopId},
            $or:[
                {
                    name:{$regex:query,$options:"i"}
                },
                {    
                    category:{$regex:query,$options:"i"},
                }
            ]
        }).populate("shop","name image")
        return res.status(200).json(items)
    } catch (error) {
        return res.status(500).json({message:`search item error ${error}`})
    }
}