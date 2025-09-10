import express from "express"
import { createShop, getShop, getShopByCity } from "../controller/shopcontroller.js"
import isAuth from "../middleware/isAuth.js"
import { upload } from "../middleware/multer.js"


const shopRouter = express.Router()

shopRouter.post('/create-edit',isAuth,upload.single("image"),createShop)
shopRouter.get('/getshop',isAuth,getShop)
shopRouter.get('/getshop-by-city/:city',isAuth,getShopByCity)



export default shopRouter