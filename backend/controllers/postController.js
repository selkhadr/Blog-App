const fs = require("fs");
const path = require("path");
const asyncHandler = require("express-async-handler");
const {Post,validateCreatePost} = require("../models/Posts");
const {cloudinaryUploadImage}=require("../utils/cloudinary");
const { json } = require("stream/consumers");

/**
 *@desc create new post
 * @router /api/posts
 * @method post
 * @access private (only logged in user)
 */
module.exports.createPostCtr = asyncHandler(async(req,res)=>{
    if(!req.file){
        return res.status(400).json({message:"no image was provided"});
    }
    const {error}= validateCreatePost(req.body);
    if(error){
        return res.status(400).json({message:error.details[0].message});
    }
    const imagePath = path.join(__dirname,`../images/${req.file.filename}`);
    const result = await cloudinaryUploadImage(imagePath);
    const post = await Post.create({
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        user: req.user.id,
        image: {
            url: result.secure_url,
            publicId: result.publicId,
        }
    })
    res.status(201).json(post);
    fs.unlinkSync(imagePath);
})