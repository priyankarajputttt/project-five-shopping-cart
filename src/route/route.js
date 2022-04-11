const express = require("express")

const userController = require("../controller/userController")

const router = express.Router()

router.get("/test", (req, res) => {
    res.status(200).send({status: true, message: "it's working"})
})



module.exports = router