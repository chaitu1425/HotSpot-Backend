import express from "express"
import isAuth from "../middleware/isAuth.js"
import { addItems, editItem } from "../controller/itemcontroller.js"
import { upload } from "../middleware/multer.js"


const itemRouter = express.Router()

itemRouter.post("/add-item",isAuth,upload.single("image"),addItems)
itemRouter.post('/edit-item/:itemId',isAuth,upload.single("image"),editItem)

export default itemRouter