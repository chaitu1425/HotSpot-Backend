import express from "express"
import isAuth from "../middleware/isAuth.js"
import { addItems, deleteItem, editItem, getItemByCity, GetItemByid, getItemsByShop, searchItems } from "../controller/itemcontroller.js"
import { upload } from "../middleware/multer.js"


const itemRouter = express.Router()

itemRouter.post("/add-item",isAuth,upload.single("image"),addItems)
itemRouter.post('/edit-item/:itemId',isAuth,upload.single("image"),editItem)
itemRouter.get('/get-item/:itemId',isAuth,GetItemByid)
itemRouter.delete('/delete/:itemId',isAuth,deleteItem)
itemRouter.get('/get-item-by-city/:city',isAuth,getItemByCity)
itemRouter.get('/get-item-by-shop/:shopId',isAuth,getItemsByShop)
itemRouter.get('/search-items',isAuth,searchItems)


export default itemRouter