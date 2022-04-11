const userModel = require("../model/userModel")
const validator = require("../validator/validator")
const aws = require("./aws")

const register = async (req, res) => {
    try{
        const data1 = req.body.data;
        // console.log(JSON.parse(data))
        const data = JSON.parse(data1)
        // const file = req.files
        if (!validator.isValidObject(data)){
            return res.status(400).send({status: false, message: "please fill all required fields"})
        }
        const{fname, lname, email, phone, password, address} = data
        // address = JSON.parse(address)
        // console.log(password)
        // console.log(address)
        const {shipping, billing} = address
        if (!validator.isValidObject(shipping)){
            return res.status(400).send({status: false, message: "please fill all required fields in shipping"})
        }
        if (!validator.isValidObject(billing)){
            return res.status(400).send({status: false, message: "please fill all required fields billing"})
        }
        if(!validator.isValid(fname)){
            return res.status(400).send({status: false, message: "please enter your first name"})
        }
        if(!validator.isValid(lname)){
            return res.status(400).send({status: false, message: "please enter your last name"})
        }
        if(!validator.isValid(email)){
            return res.status(400).send({status: false, message: "please enter your email"})
        }
        if(!validator.isValidEmail(email)){
            return res.status(400).send({status: false, message: "please enter valid email"})
        }
        const isEmailInUse = await userModel.findOne({email: email})
        if(isEmailInUse) {
            return res.status(400).send({status:false, message: "email already registered, enter different email"})
        }
        if(!validator.isValid(password)){
            return res.status(400).send({status: false, message: "please enter password"})
        }
        if(!validator.isValidPW(password)){
            return res.status(400).send({status: false, message: "please enter valid password, between 8 to 15 characters"})
        }
        if (!validator.isValidPhone(phone)){
            return res.status(400).send({status: false, message: "please enter valid phone number"})
        }
        const isPhoneInUse = await userModel.findOne({phone: phone})
        if(isPhoneInUse) {
            return res.status(400).send({status:false, message: "phone number already registered, enter different number"})
        }
        if(!validator.isValid(shipping.street)){
            return res.status(400).send({status: false, message: "please enter street name"})
        }
        if(!validator.isValid(shipping.city)){
            return res.status(400).send({status: false, message: "please enter name of city"})
        }
        if(!validator.isValid(shipping.pincode)){
            return res.status(400).send({status: false, message: "please enter pincode"})
        }
        if(!validator.isValid(billing.street)){
            return res.status(400).send({status: false, message: "please enter street name"})
        }
        if(!validator.isValid(billing.city)){
            return res.status(400).send({status: false, message: "please enter name of city"})
        }
        if(!validator.isValid(billing.pincode)){
            return res.status(400).send({status: false, message: "please enter pincode"})
        }
        const link = await getProfileImgLink(req, res)
        data.profileImage = link
        // return res.send({data: data})
        const user = await userModel.create(data)
        return res.status(201).send({status: true, message: 'Success', data: user})
    }catch(error){
        return res.status(500).send({status: false, message: error.message})
    }
}

const getProfileImgLink = async (req, res) => {
    try{
        let files = req.files
        if(files && files.length > 0){
            let uploadedFileURL = await aws.uploadFile(files[0])
            // return res.status(201).send({status: true, message: "file uploaded succesfully", data: uploadedFileURL})
            return uploadedFileURL
        }else{
            return res.status(400).send({ msg: "No file found" })
        }
    }catch(error){
        return res.status(500).send({status: false, message: error.message })
    }
}

module.exports.register = register