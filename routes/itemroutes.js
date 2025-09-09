import express from "express"
import isAuth from "../middleware/isAuth.js"
import { addItems, editItem, GetItemByid } from "../controller/itemcontroller.js"
import { upload } from "../middleware/multer.js"


const itemRouter = express.Router()

itemRouter.post("/add-item",isAuth,upload.single("image"),addItems)
itemRouter.post('/edit-item/:itemId',isAuth,upload.single("image"),editItem)
itemRouter.get('/get-item/:itemId',isAuth,upload.single("image"),GetItemByid)

export default itemRouter