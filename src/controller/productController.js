const productModel = require("../model/productModel");
const validator = require("../validator/validator")
const aws = require("./aws")

const createProduct = async function (req, res) {

    try {
        const products = req.body

        if (!validator.isValidObject(products)) {
            return res.status(400).send({ status: false, msg: "Plaese Provide all required field" })
        }
        //DE STRUCTURING
        const { title, description,style, price, currencyId, currencyFormat, availableSizes } = products

        if (!validator.isValid(title)) {
            return res.status(400).send({ status: false, msg: "Please Provide Title" })
        }
        const titleInUse = await productModel.findOne({title: title})
        if(titleInUse){
            return res.status(400).send({ status: false, msg: "enter different Title" })
        }
        if (!validator.isValid(description)) {
            return res.status(400).send({ status: false, msg: "Please Provide Description" })
        }
        if (!validator.isValid(style)) {
            return res.status(400).send({ status: false, msg: "Please Provide style" })
        }
        if (!validator.isValid(price)) {
            return res.status(400).send({ status: false, msg: "Please Provide Price" })
        }
        if (!validator.isValid(availableSizes)) {
            return res.status(400).send({ status: false, msg: "Please Provide Available Sizes" })
        }
        for (let i of availableSizes){
            if(!validator.isValidSize(i)){
                return res.status(400).send({ status: false, msg: 'Please Provide Available Sizes from S,XS,M,X,L,XXL,XL' })
            }
        }
        const link = await getProductImageLink(req, res)
        products.productImage = link
        // return res.send({data: data})
        const product = await productModel.create(products)
        return res.status(201).send({ status: true, message: 'Success', data: product })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

const getProductImageLink = async function (req, res) {
    try {
        let files = req.files
        if (files && files.length > 0) {
            let uploadedFileURL = await aws.uploadFile(files[0])
            return uploadedFileURL
        }
        else {
            return res.status(400).send({ status: false, msg: "file Not FOUND" })
        }
    }
    catch (err){
        return res.status(500).send ({ status:false, error:err.msg})
    }
}

const getSpecificProduct = async function (req, res) {
    try{
        let data = {
            isDeleted: false
        }
        let queryDataSize = req.query.size;
        if (queryDataSize) {
            if (!(validator.isValid(queryDataSize)) && (validator.isValidSize(queryDataSize))) {
                return res.status(400).send("plz Enter a valid Size")
            }
            data["availableSizes"] = queryDataSize;
        }
        let name = req.query.name;
        if (name) {
            if (!validator.isValid(name)) {
                return res.status(400).send("plz enter a valid name")
            }
            data["title"] = {$regex: name}
        }
        let priceGreaterThan = req.query.priceGreaterThan;
        if (priceGreaterThan) {
            if (!validator.isValid(priceGreaterThan)) {
                return res.status(400).send("plz enter a valid name")
            }
            data["price"] = {
                $gte: priceGreaterThan
            }
        }
        let priceLessThan = req.query.priceLessThan;
        if (priceLessThan) {
            if (!validator.isValid(priceLessThan)) {
                return res.status(400).send("plz enter a valid name")
            }
            data["price"] = {
                $lte: priceLessThan
            }
        }
        if( priceLessThan && priceGreaterThan){
            if(!validator.isValid(priceLessThan)){
                return res.status(400).send("plz enter a valid price")
            }
            if(!validator.isValid(priceGreaterThan)){
                return res.status(400).send("plz enter a valid price")
            }
            data["price"] = {$lte:priceLessThan,$gte:priceGreaterThan}
    
        }
        let filerProduct = await productModel.find(data).sort({price: req.query.priceSort})//.skip(8)//.limit(1)//.count();
        // let filerProduct = await productModel.find({title: {$regex: name}});
        if (filerProduct.length === 0) {
            return res.status(400).send({
                status: true,
                msg: "No product found"
            })
        }
        return res.status(200).send({
            statu: true,
            msg: "products you want",
            data: filerProduct
        })
    }catch(error){
        return res.status(500).send ({status:false, message: error.message})
    }
}

const getProductByProductId = async (req,res) => {

    try{
            const productId = req.params.productId

        if(!validator.isValidObjectId(productId))
        {return res.status(400).send({status:true, message:"Invalid productId"})}

        const getDataByProductId = await productModel.findById({_id:productId})

        if(!getDataByProductId)
        {return res.status(404).send({status:true, message:`This ${productId} productId not exist `})}
        
        return res.status(200).send({status:true, message:getDataByProductId})


    } catch (err){
       return res.status(500).send({Error:err.message})
    }
}


const deleteProduct = async (req, res) => {
    try{
            const productId = req.params.productId
        if(!validator.isValidObjectId(productId))
        {return res.status(400).send({status:true, message:"Invalid productId"})}
         const deletedProductId = await productModel.findById({_id:productId})
         if(!deletedProductId)
         {return res.status(404).send({status:true, message:`This ${productId} productId does not exist `})}
          if(deletedProductId.isDeleted !== false)
         {return res.status(400).send({status:true, message:`This ${productId} productId is already Deleted `})}
         await productModel.findByIdAndUpdate({_id:productId}, {$set:{isDeleted:true}}, {new : true})
        return res.status(200).send({status:true, message:"Deleted Successfully"})
    } catch(err){
        return res.status(500).send({Error:err.message})
    }
}

module.exports.createProduct = createProduct
module.exports.getSpecificProduct = getSpecificProduct
module.exports.getProductByProductId = getProductByProductId
module.exports.deleteProduct = deleteProduct
