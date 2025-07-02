const router = require("express").Router();
const photoUpload = require("../middlewares/photoUpload");
const {verifyToken}=require("../middlewares/verifyToken");
const {createPostCtr, getAllPostsCtrl, getSinglePostCtrl, getPostCountCtrl}=require("../controllers/postController");
const validateObjectId = require("../middlewares/validateObjectId");
router.route("/")
    .post(verifyToken, photoUpload.single("image"),createPostCtr)
    .get(getAllPostsCtrl);
    
router.route("/count").get(getPostCountCtrl);

router.route("/:id").get(validateObjectId, getSinglePostCtrl);
module.exports =router;
