import Order from '../model/ordermodel.js'
import Shop from '../model/shopmodel.js'
export const placeorder = async(req,res)=>{
    try{
        const {cartItems,paymentMethod,deliveryAddress,totalAmount} = req.body
        if(cartItems.length == 0 || !cartItems){
            return res.status(400).json({message:'Cart is empty'})
        }
        if(!deliveryAddress.text || !deliveryAddress.latitude || !deliveryAddress.longitude){
            return res.status(400).json({message:'send complete address'})
        }
        const groupItemsByShop ={}

        cartItems.forEach(item => {
            const shopId = item.shop
            if(!groupItemsByShop[shopId]){
                groupItemsByShop[shopId]=[]
            }
            groupItemsByShop[shopId].push(item)
        });
        const shopOrders = await Promise.all(Object.keys(groupItemsByShop).map(async(shopId)=>{
            const shop = await Shop.findById(shopId).populate("owner")
            if(!shop){
                return res.status(400).json({message:'shop not found'})
            }
            const items = groupItemsByShop[shopId]
            const subtotal = items.reduce((sum,i)=>sum+Number(i.price)*Number(i.quantity),0)
            return {
                shop:shop._id,
                owner:shop.owner.id,
                subtotal,
                shopOrderItems:items.map((i)=>({
                    item:i.id,
                    name:i.name,
                    price:i.price,
                    quantity:i.quantity
                }))
            }
        }))
        const newOrder = await Order.create({
            user:req.userId,
            paymentMethod,
            deliveryAddress,
            totalAmount,
            shopOrders
        })
        return res.status(201).json(newOrder)
    }catch(error){
        return res.status(500).json({message:`place order error ${error}`})
    }
}