export const placeorder = async(req,res)=>{
    try{
        const {cartItems,paymentMethod,deliveryAddress} = req.body
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

    }catch(error){

    }
}