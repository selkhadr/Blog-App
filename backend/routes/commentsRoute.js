const router = require("express").Router();
const { createCommentCtrl, getAllCommentsCtrl, deleteCommentsCtrl } = require("../controllers/commentsController");
const {verifyToken, verifyTokenAndAdmin}=require("../middlewares/verifyToken")
const validateObjectId = require("../middlewares/validateObjectId")

router.route("/").post(verifyToken, createCommentCtrl)
.get(verifyTokenAndAdmin, getAllCommentsCtrl);

router.route("/:id").delete(validateObjectId, verifyToken, deleteCommentsCtrl);

module.exports = router;