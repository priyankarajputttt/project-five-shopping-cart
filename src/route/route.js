const express = require("express")

const userController = require("../controller/userController")
const mw = require("../middleware/auth")

const router = express.Router()

router.get("/test", (req, res) => {
    let data = req.body.obj
    data = JSON.parse(data)
    res.status(200).send({status: true, message: "it's working", data: data})
})

router.post("/register", userController.register)

router.post("/login", userController.userlogin)

router.get("/user/:userId/profile",mw.authentication, userController.getUserProfile)

router.put("/user/:userId/profile", userController.updateUser1)

module.exports = router