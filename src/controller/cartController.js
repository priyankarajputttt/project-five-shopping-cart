const userModel = require("../model/userModel")
const productModel = require("../model/productModel")
const cartModel = require("../model/cartModel")
const validator = require("../validator/validator")


module.exports.updateCart = async (req, res) => {
    try {
        const userId = req.params.userId

        if (!validator.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Invalid UserId" })
        }

        const user = await userModel.findOne({ _id: userId })
        if (!user) {
            return res.status(404).send({ status: false, message: "User not found" })
        }

        const { cartId, productId, removeProduct } = req.body

        if (!validator.isValidObjectId(cartId)) {
            return res.status(400).send({ status: false, message: "Invalid cartId" })
        }
        if (!validator.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "Invalid productId" })
        }

        const getProduct = await productModel.findById({ _id: productId })
        if ((!getProduct) || (getProduct.isDeleted == true)) {
            return res.status(404).send({ status: false, message: "Product not found" })
        }

        const getCart = await cartModel.findOne({ _id: cartId })
        if (!getCart) {
            return res.status(404).send({ status: false, message: "CartId not found" })
        }

        if (getCart.items.length == 0) {
            return res.status(404).send({ status: false, message: "There is No Selected Product" })
        }



        let getQuantityOfProduct = 0
        let getProductIdOfItems = []
        let productInCart = 0
        for (i = 0; i < (getCart.items.length); i++) { // To get quantity of Selected Product
            if (getCart.items[i].productId == productId) {
                getQuantityOfProduct = getCart.items[i].quantity
                // getProductIdOfItems = getCart.items[i].productId
                getProductIdOfItems.push(getCart.items[i].productId)
                productInCart = 1

                
            }
        }
        if(productInCart == 0){
            return res.status(400).send({status:false, message:"There Is No Product in the Cart"})
        }
        let totalPriceOfSelectedProduct = getQuantityOfProduct * getProduct.price //  To get total price of select Product
        

        if (removeProduct == 0) { // we have to handle cartId authorization

            await cartModel.updateOne(
                { "items.productId": productId },
                { $pull: { "items": { productId: productId } } },
            )

            const updateProduct = await cartModel.findByIdAndUpdate({ _id: cartId },
                { $inc: { totalItems: -1, totalPrice: - totalPriceOfSelectedProduct } },
                { new: true })


            return res.status(200).send({
                statu: true,
                message: `This ${productId} Product Has Removed Successfully`,
                Data: updateProduct
            })
        }

        if (removeProduct == 1)  {

            for (let i = 0; i < getCart.items.length; i++) {

                if (getCart.items[i].productId == productId) {
                    const priceUpdate = getCart.totalPrice - getProduct.price
                    getCart.items[i].quantity = getCart.items[i].quantity - 1  // check if quantity is more than 1
                   
                    if (getCart.items[i].quantity > 0) {
                        const response = await cartModel.findOneAndUpdate({ _id: cartId },
                             { items: getCart.items, totalPrice: priceUpdate },
                              { new: true })
                        return res.status(200).send({ status: true, data: response })
                    }
                    else {
                        const totalItems1 = getCart.totalItems - 1  // to remove the Product from items
                        getCart.items.splice(i, 1)
                        const response = await cartModel.findOneAndUpdate({ _id: cartId },
                             { items: getCart.items, totalItems: totalItems1, totalPrice: priceUpdate }, { new: true })
                        return res.status(200).send({ status: true, data: response })
                    }
                } else {
                    return res.status(400).send({ status: false, message: `product doesnot exist` })
                }
            }
            
        }



    } catch(err) {
    return res.status(500).send({ ERROR: err.message })
}
}













