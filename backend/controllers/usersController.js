const asyncHandler = require("express-async-handler");
const {User, validateUpdateUser} = require("../models/User");
const bcrypt = require("bcryptjs");
/**
 *@desc get all users profits
 * @router /api/users/profile
 * @method get
 * @access private (only admin)
 */
module.exports.getAllUsersCtrl = asyncHandler(async(req, res)=>{
    const users = await User.find().select("-password");
    res.status(200).json(users);
})

/**
 *@desc get user profits
 * @router /api/users/profile/:id
 * @method get
 * @access public
 */
module.exports.getUserProfileCtrl = asyncHandler(async(req, res)=>{
    const user = await User.findById(req.params.id).select("-password");
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
   if(!req.file){
    res.status(400).json({message: 'no file was provided'});
   }
    res.status(200).json({message: "your profile photo uploaded successfully"}); 
})
