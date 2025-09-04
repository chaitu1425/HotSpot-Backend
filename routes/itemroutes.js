import express from "express"
import isAuth from "../middleware/isAuth"
import { addItems, editItem } from "../controller/itemcontroller"
import { upload } from "../middleware/multer"


const itemRouter = express.Router()


itemRouter.post('/add-item',isAuth,upload.single("image"),addItems)
itemRouter.post('/edit-item/:itemId',isAuth,upload.single("image"),editItem)

export default itemRouter