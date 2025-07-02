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

/**
 *@desc get all posts
 * @router /api/posts
 * @method get
 * @access public
 */
module.exports.getAllPostsCtrl = asyncHandler(async(req,res)=>{
    const POST_PER_PAGE = 3;
    const {pageNumber, category} = req.query;
    let posts;
    if(pageNumber){
        posts = await Post.find()
        .skip((pageNumber - 1)*POST_PER_PAGE)
        .limit(POST_PER_PAGE)
        .sort({createdAt:-1})
         .populate("user", ["-password"])
    }
    else if(category){
        posts = await Post.find({category: category}).sort({createdAt:-1}).populate("user", ["-password"]);
    }
    else{
        posts = await Post.find().sort({createdAt:-1}).populate("user", ["-password"]);
    }
    res.status(200).json(posts);
})

/**
 *@desc get Single post
 * @router /api/posts/:id
 * @method get
 * @access public
 */
module.exports.getSinglePostCtrl = asyncHandler(async(req,res)=>{
    const post = await Post.findById(req.params.id).populate("user", ["-password"]);
    if(!post){
        return res.status(404).json({message: "post not found"});
    }
    res.status(200).json(post);
})

/**
 *@desc get Posts count
 * @router /api/posts/count
 * @method get
 * @access public
 */
module.exports.getPostCountCtrl = asyncHandler(async(req,res)=>{
    const count = await Post.countDocuments();
    res.status(200).json(count);
})

