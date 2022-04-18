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

// const createCart = async (req, res) => {
//     try{
//         const {userId} = req.params
//         const data = req.body
//         let items = data.items
//         if (typeof(items) == "string"){
//             items = JSON.parse(items)
//         }
//         // return res.send(items)
//         let newItems
//         const isUserExist = await userModel.findOne({_id: userId})
//         if(!isUserExist){
//             return res.status(404).send({status: false, message: "user does not exist"})
//         }
//         const product = await productModel.findById({_id: items[0].productId})
//         if (!product){
//             return res.status(404).send({status: false, message: "product does not exist, or deleted"})
//         }
//         // return res.send(product)
//         const isCartexist = await cartModel.findOne({userId: userId})
//         if(isCartexist){
//             newItems = isCartexist.items
//             // console.log(newItems)
//         }
//         // items.push(data.items[0])
//         if(!isCartexist){
//             const newCart = await cartModel.create({userId: userId, items: items, totalPrice: product.price * items[0].quantity, totalItems: items.length})
//             newItems = newCart.items
//             return res.status(201).send({status: true, message: "created new cart", data: newCart})
//         }
//         let {totalPrice} = isCartexist 
//         totalPrice = Math.round(totalPrice +  product.price * items[0].quantity)
//         let isItemInArr = 0
//         for(let i = 0; i < newItems.length; i++){
//             if(newItems[i].productId == items[0].productId){
//                 isItemInArr = 1
//                 newItems[i].quantity = newItems[i].quantity + items[0].quantity
//                 // console.log("in loop")
//             }
//         }
//         if(isItemInArr == 0){
//             newItems.push(items[0])
//         }
//         const updatedCart = await cartModel.findOneAndUpdate({userId: userId},{$set: {items: newItems, totalPrice: totalPrice, totalItems: newItems.length}}, {new: true})
//         return res.status(200).send({status: true, data:updatedCart})
//     }catch(error){
//         return res.status(500).send({status: false, message: error.message})
//     }
// }

const createCart = async function(req, res) {
    let userId = req.params.userId;
    let data = req.body
    let items2 
    if(!(validator.isValid(userId))&&(validator.isValidObjectId(userId))){
        return res.status(400).send({status:false, message:"Please provide a valid userId"})
    }
    if (!validator.isValidObject(data)) {
      return res.status(400).send({status: false, message: "Plaese Provide all required field" })
  }
     let items = data.items
     if (typeof(items) == "string"){
        items = JSON.parse(items)
    }
     const isCartExist = await cartModel.findOne({userId:userId})
     let totalPrice = 0;
     if(!isCartExist){
        for(let i = 0; i < items.length; i++){
          let productId = items[i].productId
          let quantity = items[i].quantity
           let findProduct = await productModel.findById(productId);
           if(!findProduct){
            return res.status(400).send({status:false, message:"product is not valid"})
           }
           totalPrice = totalPrice + (findProduct.price*quantity)
         }
        let createCart = await cartModel.create({userId:userId,items:items,totalPrice:totalPrice,totalItems:items.length })
         items2 = createCart.items
        return res.status(200).send({status:true,data:createCart})
     } if(isCartExist){
          items2 = isCartExist.items
     }
        let findProduct = await productModel.findById(items[0].productId)
        if(!findProduct){
          return res.status(400).send({status:false, message:"product is not valid"})
         }
       // res.send(findProduct)
        let totalPrice2 = findProduct.price
        let newquantity = items[0].quantity
        let flage = 0
        
           for(let i = 0; i < items2.length; i++){
               let productId = items2[i].productId
            if(productId == items[0].productId){
                   flage = 1
                   items2[i].quantity = items2[i].quantity + newquantity}
               
   }    totalPrice2 = Math.abs(totalPrice2 * newquantity + isCartExist.totalPrice)
        if(flage == 0){
            items2.push(items[0])
        }
       let updateCart = await cartModel.findOneAndUpdate({userId:userId},{$set:{items:items2,totalPrice:totalPrice2,totalItems:items2.length}},{new:true})
               return res.send(updateCart)
   }

const getCartByUserId = async function (req, res) {
    try {
        const userId = req.params.userId
    if (!validator.isValidObjectId(userId)) {
        return res.status(400).send({ status: false, message: "Invalid User Id" })
    }
    const getProduct = await CartModel.findOne({ userId: userId })
    if(!getProduct){
        return res.status(404).send({status: false, message: "cart not found"})
    }
    return res.status(200).send({ status: true, message: "Get all product which is avilable in cart", data: getProduct })
    }
    catch (error) {
        return res.status(500).send({ status: false, ERROR: error.message })
    }
}

module.exports.deleteCartItems = deleteCartItems
module.exports.createCart = createCart
module.exports.getCartByUserId = getCartByUserId