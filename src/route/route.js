const express = require("express")

const userController = require("../controller/userController")
const productController = require("../controller/productController")
const mw = require("../middleware/auth")

const router = express.Router()

router.get("/test", (req, res) => {
    let data = req.body
    res.status(200).send({status: true, message: "it's working", data: data})
})
// user
router.post("/register", userController.register)

router.post("/login", userController.userlogin)

router.get("/user/:userId/profile",mw.authentication, userController.getUserProfile)

router.put("/user/:userId/profile", userController.updateUser)

//products
router.post("/products", productController.createProduct)

router.get("/products", productController.getSpecificProduct)

module.exports = router