const router = require("express").Router();
const photoUpload = require("../middlewares/photoUpload");
const {verifyToken}=require("../middlewares/verifyToken");
const {createPostCtr, getAllPostsCtrl, getSinglePostCtrl, getPostCountCtrl, deletePostCtrl, updatePostCtrl, updatePostImageCtrl}=require("../controllers/postController");
const validateObjectId = require("../middlewares/validateObjectId");
router.route("/")
    .post(verifyToken, photoUpload.single("image"),createPostCtr)
    .get(getAllPostsCtrl);
    
router.route("/count").get(getPostCountCtrl);

router.route("/:id").get(validateObjectId, getSinglePostCtrl)
.delete(validateObjectId, verifyToken, deletePostCtrl)
.put(validateObjectId, verifyToken,updatePostCtrl);

router.route("/update-image/:id")
.put(validateObjectId, verifyToken, photoUpload.single("image"),updatePostImageCtrl)
module.exports =router;
