import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'

const uploadonCloudinary = async (file) => {
    cloudinary.config({
        cloud_name: process.env.Cloud_NAME,
        api_key: process.env.Cloud_API_KEY,
        api_secret: process.env.Cloud_API_SECRET
    });
    try {
        const result=await cloudinary.uploader.upload(file)
        fs.unlinkSync(file)
        return result.secure_url
    } catch (error) {
        fs.unlinkSync(file)
        console.log(error)
    }
}

export default uploadonCloudinary
 