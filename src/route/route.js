const express = require("express")

const userController = require("../controller/userController")

const router = express.Router()

router.get("/test", (req, res) => {
    let data = req.body.obj
    data = JSON.parse(data)
    res.status(200).send({status: true, message: "it's working", data: data})
})

router.post("/register", userController.register)

router.get("/user/:userId/profile", userController.getUserProfile)

router.post("/login", userController.userlogin)

module.exports = router