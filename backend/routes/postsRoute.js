const router = require("express").Router();
const photoUpload = require("../middlewares/photoUpload");
const {verifyToken}=require("../middlewares/verifyToken");
const {createPostCtr}=require("../controllers/postController");

router.route("/")
    .post(verifyToken, photoUpload.single("image"),createPostCtr);
    
module.exports =router;
