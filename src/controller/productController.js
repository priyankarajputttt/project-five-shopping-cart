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

        if (!validator.isValid(description)) {
            return res.status(400).send({ status: false, msg: "Please Provide Description" })
        }

        if (!validator.isValid(style)) {
            return res.status(400).send({ status: false, msg: "Please Provide style" })
        }

        if (!validator.isValid(price)) {
            return res.status(400).send({ status: false, msg: "Please Provide Price" })
        }

        if (!validator.isValid(currencyId)) {
            return res.status(400).send({ status: false, msg: "Please Provide Currency ID" })
        }

        if (!validator.isValid(currencyFormat)) {
            return res.status(400).send({ status: false, msg: "Please Provide Crrency Format" })
        }

        if (!validator.isValid(availableSizes)) {
            return res.status(400).send({ status: false, msg: "Please Provide Available Sizes" })
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
        data["title"] = name
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

    let filerProduct = await productModel.find(data);
    if (!filerProduct) {
        return res.status(400).send({
            statu: true,
            msg: "No product found",
            data: filerProduct
        })
    }
    return res.status(200).send({
        statu: true,
        msg: "products you want",
        data: filerProduct
    })
}

module.exports.createProduct = createProduct
module.exports.getSpecificProduct = getSpecificProduct