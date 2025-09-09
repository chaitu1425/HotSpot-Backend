import express from "express"
import isAuth from "../middleware/isAuth.js"
import { addItems, deleteItem, editItem, GetItemByid } from "../controller/itemcontroller.js"
import { upload } from "../middleware/multer.js"


const itemRouter = express.Router()

itemRouter.post("/add-item",isAuth,upload.single("image"),addItems)
itemRouter.post('/edit-item/:itemId',isAuth,upload.single("image"),editItem)
itemRouter.get('/get-item/:itemId',isAuth,upload.single("image"),GetItemByid)
itemRouter.delete('/delete/:itemId',isAuth,deleteItem)

export default itemRouter