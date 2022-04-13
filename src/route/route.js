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

router.get("/user/:userId/profile", userController.getUserProfile)

router.put("/user/:userId/profile", userController.updateUser)

//products
router.post("/products", productController.createProduct)

router.get("/products", productController.getSpecificProduct)

router.get("/products/:productId", productController.getProductByProductId)

router.put("/products/:productId", productController.updatedProduct)

router.delete("/products/:productId", productController.deleteProduct)



router.get("*", (req, res) => {
    return res.status(404).send({status: false, message: "page not found"})
})
router.post("*", (req, res) => {
    return res.status(404).send({status: false, message: "page not found"})
})
module.exports = router