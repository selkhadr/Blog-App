const asyncHandler = require("express-async-handler");
const {Comment, validateCreateComment, validateUpdateComment}=require("../models/comment");
const { json } = require("express");
const {User} = require("../models/User")

/**
 *@desc create new comment
 * @router /api/comments
 * @method post
 * @access private (only logged in user)
 */
module.exports.createCommentCtrl = asyncHandler(async(req,res)=>{
    const {error}=validateCreateComment(req.body);
    if(error){
        return res.status(400).json({message:error.details[0].message});
    }
    const profile = await User.findById(req.user.id);
    console.log(req.body);
    const comment = await Comment.create({
        postId:req.body.postId,
        text:req.body.text,
        user: req.user.id,
        username:profile.username,
        });
    res.status(201).json(comment);
})

/**
 *@desc get all comments
 * @router /api/comments
 * @method get
 * @access private (only admin)
 */
module.exports.getAllCommentsCtrl = asyncHandler(async(req,res)=>{
    const comments = await Comment.find().populate("user");
    res.status(200).json(comments);
})

/**
 *@desc delete comments
 * @router /api/comments/:id
 * @method delete
 * @access private (only admin or owner of the comment)
 */
module.exports.deleteCommentsCtrl = asyncHandler(async(req,res)=>{

    const comment = await Comment.findById(req.params.id);
    if(!comment){
        return res.status(404).json({message:"comment not found"});
    }
    if(req.user.isAdmin || req.user.id === comment.user.toString()){
        await Comment.findByIdAndDelete(req.params.id);
        res.status(200).json({message:"comment ha been deleted"});
    }else{
        res.status(403).json({message:"access denied"});
    }
})

/**
 *@desc update comment
 * @router /api/comments/:id
 * @method put
 * @access private (only owner of the comment)
 */
module.exports.updateCommentCtrl = asyncHandler(async(req,res)=>{
    const {error}=validateUpdateComment(req.body);
    if(error){
        return res.status(400).json({message:error.details[0].message});
    }
    const comment = await Comment.findById(req.params.id);
    if(!comment){
        return res.status(404).json({message:"comment not found"});
    }
    if(req.user.id !== comment.user.toString()){
        return res.status(403).json({message:"access denied, only user himself can edit his comment"});
    }
    const updatedComment = await Comment.findByIdAndUpdate(req.params.id,{
        $set:{
            text:req.body.text,
        }
    },{new:true});
    res.status(200).json(updatedComment);
})
