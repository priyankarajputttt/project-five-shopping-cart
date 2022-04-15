const cartModel = require("../model/cartModel")
const userModel = require("../model/userModel")
const validator = require("../validator/validator")
const productModel = require("../model/productModel");

const deleteCartItems = async (req, res) => {
    try{
        const {userId} = req.params
        if(!validator.isValidObjectId(userId)){
            return res.status(404).send({status: false, message: "invalid userID"})
        }
        const isUserExist = await userModel.findOne({_id: userId})
        if(!isUserExist){
            return res.status(404).send({status: false, message: "user does not exist"})
        }
        const isCartexist = await cartModel.findOne({userId: userId})
        if(!isCartexist){
            return res.status(404).send({status: false, message: "cart does not exist"})
        }
        const data = {
            items: [],
            totalPrice: 0,
            totalItems: 0
        }
        const emptyCart = await cartModel.findOneAndUpdate({userId: userId}, data, {new: true})
        return res.status(200).send({status: true, message: "remove all items from cart", data: emptyCart})
    }catch(error){
        return res.status(500).send({status: false, message: error.message})
    }
}

const createCart = async (req, res) => {
    try{
        const {userId} = req.params
        const data = req.body
        const items = data.items
        let newItems
        const isUserExist = await userModel.findOne({_id: userId})
        if(!isUserExist){
            return res.status(404).send({status: false, message: "user does not exist"})
        }
        const product = await productModel.findById({_id: items[0].productId})
        if (!product){
            return res.status(404).send({status: false, message: "product does not exist, or deleted"})
        }
        // return res.send(product)
        const isCartexist = await cartModel.findOne({userId: userId})
        if(isCartexist){
            newItems = isCartexist.items
            // console.log(newItems)
        }
        // items.push(data.items[0])
        if(!isCartexist){
            const newCart = await cartModel.create({userId: userId, items: items, totalPrice: product.price * items[0].quantity, totalItems: items.length})
            newItems = newCart.items
            return res.status(201).send({status: true, message: "created new cart", data: newCart})
        }
        let {totalPrice} = isCartexist 
        totalPrice = Math.round(totalPrice +  product.price * items[0].quantity)
        let isItemInArr = 0
        for(let i = 0; i < newItems.length; i++){
            if(newItems[i].productId == items[0].productId){
                isItemInArr = 1
                newItems[i].quantity = newItems[i].quantity + items[0].quantity
                // console.log("in loop")
            }
        }
        if(isItemInArr == 0){
            newItems.push(items[0])
        }
        const updatedCart = await cartModel.findOneAndUpdate({userId: userId},{$set: {items: newItems, totalPrice: totalPrice, totalItems: newItems.length}}, {new: true})
        return res.status(200).send(updatedCart)
    }catch(error){
        return res.status(500).send({status: false, message: error.message})
    }
}

const test = async (req, res) => {
    const data = {
        userId: "6253fca3efb23e534c057bfe",
        items: [
            {
            productId: "62552d1d21b4287a453e384b",
            quantity: 6
            },
            {
                productId: "62552cc49e2992a7790591e1",
                quantity: 4
                }
        ],
        totalPrice: 100,
        totalItems: 1
    }
    const cart = await cartModel.create(data)
    return res.send(cart)
}

module.exports.deleteCartItems = deleteCartItems
module.exports.test = test
module.exports.createCart = createCart