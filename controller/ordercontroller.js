import DeliveryAssignment from '../model/deliveryAssignmentModel.js'
import Order from '../model/ordermodel.js'
import Shop from '../model/shopmodel.js'
import User from '../model/usermodel.js'
import { sendDeliveryOTP } from '../utils/mail.js'

export const placeorder = async (req, res) => {
    try {
        const { cartItems, paymentMethod, deliveryAddress, totalAmount } = req.body
        if (cartItems.length == 0 || !cartItems) {
            return res.status(400).json({ message: 'Cart is empty' })
        }
        if (!deliveryAddress.text || !deliveryAddress.latitude || !deliveryAddress.longitude) {
            return res.status(400).json({ message: 'send complete address' })
        }
        const groupItemsByShop = {}

        cartItems.forEach(item => {
            const shopId = item.shop
            if (!groupItemsByShop[shopId]) {
                groupItemsByShop[shopId] = []
            }
            groupItemsByShop[shopId].push(item)
        });
        const shopOrders = await Promise.all(Object.keys(groupItemsByShop).map(async (shopId) => {
            const shop = await Shop.findById(shopId).populate("owner")
            if (!shop) {
                return res.status(400).json({ message: 'shop not found' })
            }
            const items = groupItemsByShop[shopId]
            const subtotal = items.reduce((sum, i) => sum + Number(i.price) * Number(i.quantity), 0)
            return {
                shop: shop._id,
                owner: shop.owner.id,
                subtotal,
                shopOrderItems: items.map((i) => ({
                    item: i.id,
                    name: i.name,
                    price: i.price,
                    quantity: i.quantity
                }))
            }
        }))
        const newOrder = await Order.create({
            user: req.userId,
            paymentMethod,
            deliveryAddress,
            totalAmount,
            shopOrders
        })
        await newOrder.populate("shopOrders.shopOrderItems.item","name image price")

        return res.status(201).json(newOrder)
    } catch (error) {
        return res.status(500).json({ message: `place order error ${error}` })
    }
}

export const getMyOrders = async (req, res) => {
    try {
        const user = await User.findById(req.userId)
        if (user.role == "user") {
            const orders = await Order.find({ user: req.userId })
                .sort({ createdAt: -1 })
                .populate("shopOrders.shop", "name")
                .populate("shopOrders.owner", "name email mobile")
                .populate("shopOrders.shopOrderItems.item", "name image price")

            return res.status(200).json(orders)
        } else if(user.role == "owner"){
            const orders = await Order.find({ "shopOrders.owner": req.userId })
                .sort({ createdAt: -1 })
                .populate("shopOrders.shop", "name")
                .populate("user")
                .populate("shopOrders.shopOrderItems.item", "name image price")
                .populate("shopOrders.assignedDeliveryBoy","fullname mobile")

            const filterOrder = orders.map((order)=>({
                _id:order._id,
                paymentMethod:order.paymentMethod,
                user:order.user,
                shopOrders:order.shopOrders.find(o=>o.owner._id==req.userId),
                createdAt:order.createdAt,
                deliveryAddress:order.deliveryAddress

            }))
            return res.status(200).json(filterOrder)
        }
    } catch (error) {
        return res.status(500).json({ message: `get user orders error ${error}` })
    }
}

export const updateOrderStatus = async(req,res)=>{
    try {
        const {orderId,shopId} = req.params
        const {status} = req.body
        const order = await Order.findById(orderId)
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const shopOrder = order.shopOrders.find(o=>o.shop.equals(shopId))
        if(!shopOrder){
            return res.status(400).json({message:'shop order not found'})
        }
        shopOrder.status = status
        let deliveryBoysPayload = []
        if(status==="out for delivery" && !shopOrder.assignment){
            const {longitude,latitude} = order.deliveryAddress
            const nearByDeliveryBoys = await User.find({
                role:"deliveryboy",
                location:{
                    $near:{
                        $geometry:{
                            type:'Point',coordinates:[Number(longitude),Number(latitude)]
                        },
                        $maxDistance:5000
                    }
                }
            })
            const nearByIds = nearByDeliveryBoys.map(b=>b._id)
            const busyIds = await DeliveryAssignment.find({
                assignedTo:{
                    $in:nearByIds
                },
                status:{$nin:["broadcasted","completed"]}
            }).distinct("assignedTo")

            const busyIdSet = new Set(busyIds.map(id=>String(id)))

            const availableBoys = nearByDeliveryBoys.filter(b=>!busyIdSet.has(b._id))

            const candidates = availableBoys.map(b=>b._id)
            if(candidates.length==0){
                await order.save()
                return res.status(202).json({message:'Order Status Updated but there is no available delivery boys'})
            }

            const deliveryAssignment = await DeliveryAssignment.create({
                order:order._id,
                shop:shopOrder.shop,
                shopOrderId:shopOrder._id,
                broadcastedTo:candidates,
                status:"broadcasted"
            })

            shopOrder.assignedDeliveryBoy=deliveryAssignment.assignedTo
            shopOrder.assignment = deliveryAssignment._id
            deliveryBoysPayload = availableBoys.map(b=>({
                id:b._id,
                fullname:b.fullname,
                longitude:b.location.coordinates[0],
                latitude:b.location.coordinates[1],
                mobile:b.mobile
            }))
        }
        
        await order.save()
        const updatedShopOrder = order.shopOrders.find(o=>o.shop==shopId)
        await order.populate("shopOrders.shop","name")
        await order.populate("shopOrders.assignedDeliveryBoy","fullname email mobile")


        return res.status(200).json({
            shopOrder:updatedShopOrder,
            assignedDeliveryBoy:updatedShopOrder?.assignedDeliveryBoy,
            availableBoys:deliveryBoysPayload,
            assignment:updatedShopOrder?.assignment._id

        })
    } catch (error) {
        return res.status(500).json({ message: `Update status orders error ${error}` })
    }
}

export const getDeliveryBoyAssignment = async(req,res)=>{
    try {
        const deliveryBoyId = req.userId
        const assignments = await DeliveryAssignment.find({
            broadcastedTo:deliveryBoyId,
            status:"broadcasted"
        })
        .populate("order")
        .populate("shop")

        const formated = assignments.map(a=>({
            assignmentId:a._id,
            orderId:a.order_id,
            shopName:a.shop.name,
            deliveryAddress:a.order.deliveryAddress,
            items:a.order.shopOrders.find(so=>so._id.equals(a.shopOrderId)).shopOrderItems || [],
            subtotal:a.order.shopOrders.find(so=>so._id.equals(a.shopOrderId)).subtotal || []
        }))

        return res.status(200).json(formated)
    } catch (error) {
        return res.status(500).json({ message: `get delivery boy assignment error ${error}` })
    }
}


export const acceptOrder = async(req,res)=>{
    try {
        const {assignmentId} = req.params
        const assignement = await DeliveryAssignment.findById(assignmentId)
        if(!assignement){
            return res.status(400).json({message:'assignment not found'})
        }
        if(assignement.status!=="broadcasted"){
            return res.status(400).json({message:'assignment is expired'})
        }
        const alreadyAssigned = await DeliveryAssignment.findOne({
            assignedTo:req.userId,
            status:{$nin:["broadcasted","completed"]},
        })
        if(alreadyAssigned){
            return res.status(400).json({message:'you are already assigned to other order'})
        }
        assignement.assignedTo = req.userId
        assignement.status = 'assigned'
        assignement.acceptedAt = new Date()
        await assignement.save()

        const order = await Order.findById(assignement.order)
        if(!order){
            return res.status(400).json({message:'order not found'})
        }

        const shopOrder = order.shopOrders.find(so=>so._id.equals(assignement.shopOrderId))
        shopOrder.assignedDeliveryBoy = req.userId
        
        await order.save()
        return res.status(200).json({
            message:'Order accepted'
        })
    } catch (error) {
        return res.status(500).json({ message: `accepte oder error ${error}` })
    }
}


export const getCurrentOrder = async(req,res)=>{
    try {
        const assignment = await DeliveryAssignment.findOne({
            assignedTo:req.userId,
            status:"assigned"
        })
        .populate("shop","name")
        .populate("assignedTo","fullname email moile location")
        .populate({
            path:"order",
            populate:[{path:"user",select:"fullname email mobile location"}],
            
        })
        if(!assignment){
            return res.status(400).json({message:"assignment not found"})
        }
        if(!assignment.order){
            return res.status(400).json({message:"order not found"})
        }
        const shopOrder = assignment.order.shopOrders.find(so=>String(so._id)==String(assignment.shopOrderId))
        if(!shopOrder){
            return res.status(400).json({message:"shop order not found"})
        }
        let deliveryBoylocation = {lat:null,lon:null}
        if(assignment.assignedTo.location.coordinates.length==2){
            deliveryBoylocation.lat= assignment.assignedTo.location.coordinates[1]
            deliveryBoylocation.lon= assignment.assignedTo.location.coordinates[0]
        }
        let customerlocation = {lat:null,lon:null}
        if(assignment.order.deliveryAddress){
            customerlocation.lat = assignment.order.deliveryAddress.latitude
            customerlocation.lon = assignment.order.deliveryAddress.longitude
        }

        return res.status(200).json({
            _id:assignment.order._id,
            user:assignment.order.user,
            shopOrder,
            deliveryAddress:assignment.order.deliveryAddress,
            deliveryBoylocation,
            customerlocation
        })

    } catch (error) {
        return res.status(500).json({ message: `getCurrent oder error ${error}` }) 
    }
}

export const getOrderById = async(req,res)=>{
    try {
        const {orderId} = req.params
        const order = await Order.findById(orderId)
        .populate("user")
        .populate({
            path:"shopOrders.shop",
            model:"Shop"
        })
        .populate({
            path:"shopOrders.assignedDeliveryBoy",
            model:"User"
        })
        .populate({
            path:"shopOrders.shopOrderItems.item",
            model:"Item"
        })
        .lean()

        if(!order){
            return res.status(400).json({message:"order not found"})
        }
        return res.status(200).json(order)
    } catch (error) {
        return res.status(500).json({ message: `get oder by id error ${error}` })
    }    
}

export const sendDeliveryOtp = async(req,res)=>{
    try {
        const {orderId,shopOrderId} = req.body
        const order = await Order.findById(orderId)
        .populate("user")
        const shopOrder = order.shopOrders.id(shopOrderId)
        if(!order || !shopOrder ){
            return res.status(400).json({message:'enter valid order/shopOrderId'})
        }
        const otp = Math.floor(100000+Math.random()*900000).toString()
        shopOrder.deliveryOtp=otp
        shopOrder.otpExpires=Date.now()+ 5*60*1000
        await order.save()
        await sendDeliveryOTP(order.user,otp)
        return res.status(200).json({message:`OTP sent successfully to ${order.user?.fullname}`})
    } catch (error) {
        return res.status(500).json({ message: `send delivery otp error ${error}` })
        
    }
}

export const verifyDeliveryOTP = async(req,res)=>{
    try {
        const {orderId,shopOrderId,otp} = req.body
        const order = await Order.findById(orderId)
        .populate("user")
        const shopOrder = order.shopOrders.id(shopOrderId)
        if(!order || !shopOrder ){
            return res.status(400).json({message:'enter valid order/shopOrderId'})
        }
        if(shopOrder.deliveryOtp!==otp || !shopOrder.otpExpires || shopOrder.otpExpires < Date.now()) {
            return res.status(400).json({message:'Invalid/Expired OTP'}) 
        }

        shopOrder.status="delivered"
        shopOrder.deliveredAt=Date.now()
        await order.save()

        await DeliveryAssignment.deleteOne({
            shopOrderId:shopOrder._id,
            order:orderId,
            assignedTo:shopOrder.assignedDeliveryBoy
        })
        return res.status(200).json({message:"Order Delivered Successfully!"})
        
    } catch (error) {
        return res.status(500).json({ message: `verify delivery otp error ${error}` })
    }
}