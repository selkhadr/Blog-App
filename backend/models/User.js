const mongoose = require("mongoose");
const joi = require("joi");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        trim:true,
        minlength: 2,
        maxlength:100,
    },
    email:{
        type: String,
        required: true,
        trim:true,
        minlength: 2,
        maxlength:100,
        unique:true,
    },
    password:{
        type: String,
        required: true,
        trim:true,
        minlength: 8,
    },
    profilePhoto:{
        type: Object,
        default: {
            url: "https://cdn.pixabay.com/photo/2014/03/24/13/49/avatar-294480_640.png",
            publicId: null,
        }
    },
    bio:{
        type: String,
    },
    isAdmin:{
        type:Boolean,
        default: false,
    },
    isAccountVerified:{
        type:Boolean,
        default: false,
    },
},{timestamps:true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
});

UserSchema.virtual("posts",{
    ref:"Post",
    foreignField:"user",
    localField:"_id",
})

UserSchema.methods.generateAuthToken = function(){
    return jwt.sign({id: this._id, isAdmin: this.isAdmin}, process.env.JWT_SECRET);
}

const User = mongoose.model("User", UserSchema);

function validateRegisterUser(obj){
    const schema = joi.object({
        username: joi.string().trim().min(2).max(100).required(),
        email: joi.string().trim().min(5).max(100).required().email(),
        password: joi.string().trim().min(8).required(),
    })
    return schema.validate(obj);
}

function validateLoginUser(obj){
    const schema = joi.object({
        email: joi.string().trim().min(5).max(100).required().email(),
        password: joi.string().trim().min(8).required(),
    })
    return schema.validate(obj);
}

function validateUpdateUser(obj){
    const schema = joi.object({
        username: joi.string().trim().min(5).max(100),
        password: joi.string().trim().min(8),
        bio: joi.string(),
    })
    return schema.validate(obj);
}

module.exports = {
    User,
    validateRegisterUser,
    validateLoginUser,
    validateUpdateUser
}