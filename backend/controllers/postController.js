const fs = require("fs");
const path = require("path");
const asyncHandler = require("express-async-handler");
const {Post,validateCreatePost, validateUpdatePost} = require("../models/Posts");
const {cloudinaryUploadImage, cloudinaryRemoveImage}=require("../utils/cloudinary");
const { json } = require("stream/consumers");
const { response } = require("express");
const {Comment}=require("../models/comment");

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
    const post = await Post.findById(req.params.id)
    .populate("user", ["-password"])
    .populate("comments");
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

/**
 *@desc delete post
 * @router /api/posts/:id
 * @method delete
 * @access private (only admin or owner of the post)
 */
module.exports.deletePostCtrl = asyncHandler(async(req,res)=>{
    const post = await Post.findById(req.params.id);
    if(!post){
        return res.status(404).json({message: "post not found"});
    }
    if(req.user.isAdmin || req.user.id === post.user.toString()){
        await Post.findByIdAndDelete(req.params.id);
        await cloudinaryRemoveImage(post.image.publicId);

        await Comment.deleteMany({postId:post._id});

        res.status(200).json({message: "post has been deleted successfully", postId:post._id});
    }else{
        res.status(403).json({message: "access denied, forbidden"});

    }
})

/**
 *@desc update post
 * @router /api/posts/:id
 * @method put
 * @access private (only owner of the post)
 */
module.exports.updatePostCtrl = asyncHandler(async(req,res)=>{
    const {error} = validateUpdatePost(req.body);
    if(error){
        return res.status(400).json({message:error.details[0].message});
    }
    const post = await Post.findById(req.params.id);
    if(!post){
        return res.status(404).json({message:"post not found" })
    }
    if(req.user.id !== post.user.toString()){
        return res.status(403).json({message:"access denied; you are not allowed"})
    }
    const updatedPost = await Post.findByIdAndUpdate(req.params.id,{
        $set:{
            title:req.body.title,
            description:req.body.description,
            category:req.body.category
        }
    }, {new:true}).populate("user", ["-password"])
    res.status(200).json(updatedPost);
});

/**
 *@desc update post image
 * @router /api/posts/upload-image/:id
 * @method put
 * @access private (only owner of the post)
 */
module.exports.updatePostImageCtrl = asyncHandler(async(req,res)=>{

    if(!req.file){
        return res.status(400).json({message:"no image was provided"});
    }
    const post = await Post.findById(req.params.id);
    if(!post){
        return res.status(404).json({message:"post not found" })
    }
    if(req.user.id !== post.user.toString()){
        return res.status(403).json({message:"access denied; you are not allowed"})
    }
    await cloudinaryRemoveImage(post.image.publicId);
    const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
    const result = await cloudinaryUploadImage(imagePath);
    const updatedPost = await Post.findByIdAndUpdate(req.params.id,{
    $set:{
        image:{
            url:result.secure_url,
            publicId:result.public_id,
        }
    }
    }, {new:true});

    
    res.status(200).json(updatedPost);
    fs.unlinkSync(imagePath);
});

/**
 *@desc toggle like
 * @router /api/posts/like/:id
 * @method put
 * @access private (only logged in user)
 */
module.exports.toggleLikeCtrl = asyncHandler(async(req,res)=>{
    
    let post = await Post.findById(req.params.id);
    if(!post){
        return res.status(404).json({message:"post not found"});
    }
    const isPostAlreadyLiked = post.likes.find((user)=>user.toString()===req.user.id);

    if(isPostAlreadyLiked){
        post = await Post.findByIdAndUpdate(req.params.id,{
            $pull:{likes:req.user.id}
        }, {new:true});
    }
    else{
        post = await Post.findByIdAndUpdate(req.params.id,{
        $push:{likes:req.user.id}
        }, {new:true});

    }
    return res.status(200).json({post,likes: post.likes});
});
