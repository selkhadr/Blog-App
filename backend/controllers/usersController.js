const asyncHandler = require("express-async-handler");
const {User, validateUpdateUser} = require("../models/User");
const bcrypt = require("bcryptjs");
const path = require("path");
const {cloudinaryUploadImage, cloudinaryRemoveImage}=require("../utils/cloudinary")
const fs= require("fs");

/**
 *@desc get all users profits
 * @router /api/users/profile
 * @method get
 * @access private (only admin)
 */
module.exports.getAllUsersCtrl = asyncHandler(async(req, res)=>{
    const users = await User.find().select("-password").populate("posts");
    res.status(200).json(users);
})

/**
 *@desc get user profile
 * @router /api/users/profile/:id
 * @method get
 * @access public
 */
module.exports.getUserProfileCtrl = asyncHandler(async(req, res)=>{
    const user = await User.findById(req.params.id).select("-password").populate("posts");
    if(!user){
        return res.status(404).json({message: "user not found"});
    }
    res.status(200).json(user);
})


/**
 *@desc update user profile
 * @router /api/users/profile/:id
 * @method put
 * @access private (only user himself)
 */
module.exports.updateUserProfileCtrl = asyncHandler(async(req,res)=>{
    const {error} = validateUpdateUser(req.body);
    if(error){
        res.status(400).json({message: error.details[0].message})
    }
    if(req.body.password){
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
    }
    const updatedUser = await User.findByIdAndUpdate(req.params.id, {
        $set:{
            username: req.body.username,
            password: req.body.password,
            bio: req.body.bio,
        }
    }, {new:true}).select("-password");
    res.status(200).json(updatedUser);
});

/**
 *@desc get users count
 * @router /api/users/count
 * @method get
 * @access private (only admin)
 */
module.exports.getUsersCountCtrl = asyncHandler(async(req, res)=>{
    const count = await User.countDocuments();
    res.status(200).json(count);
})

/**
 *@desc profile photo upload
 * @router /api/users/profile/profile-photo-upload
 * @method post
 * @access private (only logged in user)
 */
module.exports.profilePhotoUploadCtrl = asyncHandler(async(req,res)=>{
   //validation
   //get the path to the image
   //upload to cloudinary
   //get the user from db
   //delete the old profile photo ila kant kayna
   //change the profile photo field in db
   //send the response to client
   // remove the image from the server
   
    if(!req.file){
    res.status(400).json({message: 'no file was provided'});
   }
   const imagePath = path.join(__dirname, `../images/${req.file.filename}`);

    const result = await cloudinaryUploadImage(imagePath);
    const user = await User.findById(req.user.id);

    if(user.profilePhoto.publicId !== null)
    {
        await cloudinaryRemoveImage(user.profilePhoto.publicId);

    }
    user.profilePhoto = {
        url: result.secure_url,
        publicId: result.public_id,
    }
    await user.save();
    res.status(200).json({message: "your profile photo uploaded successfully",
        profilePhoto:{url: result.secure_url, publicId: result.public_id}
    }); 
    fs.unlinkSync(imagePath);
})



/**
 *@desc delete user profile
 * @router /api/users/profile/:id
 * @method delete
 * @access private (only admin or user himself)
 */
module.exports.deleteUserProfileCtrl = asyncHandler(async(req,res)=>{
    //@todo delete user posts&comment
    const user = await User.findById(req.params.id);
    if(!user){
        return res.status(404).json({message: "user not found"});
    }
    await cloudinaryRemoveImage(user.profilePhoto.publicId);
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({message: "your profile has been deleted"});
});