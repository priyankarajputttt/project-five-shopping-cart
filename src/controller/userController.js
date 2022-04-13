const userModel = require("../model/userModel")
const validator = require("../validator/validator")
const aws = require("./aws")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")

const salt = 10

const register = async (req, res) => {
    try{
        const data = req.body
        if (!validator.isValidObject(data)){
            return res.status(400).send({status: false, message: "please fill all required fields"})
        }
        const{fname, lname, email, phone, password} = data
        // let address = data.address
        data.address = JSON.parse(data.address)
        // return res.send(address)
        const {shipping, billing} = data.address
        if (!validator.isValidObject(shipping)){
            return res.status(400).send({status: false, message: "please fill all required fields in shipping"})
        }
        if (!validator.isValidObject(billing)){
            return res.status(400).send({status: false, message: "please fill all required fields billing"})
        }
        if(!validator.isValid(fname)){
            return res.status(400).send({status: false, message: "please enter your first name"})
        }
        if(!validator.isValidString(fname)){
            return res.status(400).send({status: false, message: "please enter valid first name"}) 
        }
        if(!validator.isValid(lname)){
            return res.status(400).send({status: false, message: "please enter your last name"})
        }
        if(!validator.isValidString(lname)){
            return res.status(400).send({status: false, message: "please enter valid last name"}) 
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
        if(!/^[0-9]*$/.test(shipping.pincode)){
            return res.status(400).send({status: false, message: "please enter only numbers in pincode"})
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
        if(!/^[0-9]*$/.test(billing.pincode)){
            return res.status(400).send({status: false, message: "please enter only numbers in pincode"})
        }
        // bcrypt.hash(password, salt, (err, result) => {
        //     if(result){
        //         data.password = result
        //     }
        // })
        const hash = await bcrypt.hash(password, salt)
        data.password = hash
        const link = await getProfileImgLink(req, res)
        data.profileImage = link
        // return res.send({data: data})
        const user = await userModel.create(data)
        return res.status(201).send({status: true, message: 'Success', data: user})
    }catch(error){
        return res.status(500).send({status: false, message: error.message})
    }
}


const userlogin = async function (req, res){
    try{      
      const body = req.body;
      //// check body  provied or not
      if(!validator.isValidObject(body)){
          return res.status(404).send ({status:false, msg :"Please provide body"})
      }
      const emailId = req.body.email
      const password = req.body.password
      //check user exist or not
      if(!(emailId || password)) {
        return res.status(400).send ({ status : false, msg: "uer does not exist"})
      } 
     // check email provied or not
      if(!validator.isValid(emailId)){
            return res.status(400).send ({status:false , msg: "plese provide email_Id"})    
      }
      // check by regex
      if(!(validator.isValidEmail(emailId))) {
          return res.status(400).send ({status:false, msg: "please provide valid eamil with sign"})
      }
      // check password provied or not
      if(!validator.isValid(password)){
          return res.status(400).send ({status:false, msg: "please provide valid password"})
      }
     //check by regex
      if(!validator.isValidPW(password)){
          return res.status(400).send({status: false, message: "please enter valid password, between 8 to 15 characters"})
      }
      const login = await userModel.findOne({ email: emailId})
      if(!login) {
          return res.status(400).send ({ status: false , msg : "email is not register"})
      }
      bcrypt.compare(password, login.password, (err, result) => {
          if(result === true){
            let token = jwt.sign(
                {
                    userId: login._id,
                    iat: Math.floor(Date.now() / 1000),
                    exp: Math.floor(Date.now() / 1000) + 2*60*60
               
                }, "projectfivegroup30"
            );
                res.status(200).setHeader ("api-token-key", token)
                return res.status(200).send ({ status:true, msg: "created successfully" ,data:{userId: login._id, Token: token}})
            }else{
                return res.status(400).send({status: false, message: "incorrect password"})
            }
        })
      
    } 
      catch (error) {
        return res.status(500).send({ ERROR: error.message })
    }
};


const getUserProfile = async function(req,res){
    try{  
        let userId = req.params.userId;
        if(!(validator.isValid(userId) && validator.isValidObjectId(userId))) {
          return res.status(400).send({status: false, msg: "user  Id not valid"})
      }
      let getUserProfile = await userModel.findById(userId);
      if(!getUserProfile){
          return res.status(404).send({status:false, msg:"User Not Found"})
      }
     return res.status(200).send({status:true, message: "User profile details",data:getUserProfile})
  }catch (err) {
      console.log("This is the error :", err.message);
      return res.status(500).send({ msg: "Error", error: err.message });
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
            return res.status(400).send({status: false, message: "please enter profile pic" })
        }
    }catch(error){
        return res.status(500).send({status: false, message: error.message })
    }
}


const updateUser = async (req, res) => {
    try{
        const {userId} = req.params
        if (!validator.isValidObjectId(userId)){
            return res.status(400).send ({status:false, message :"Please provide valid ID"})
        }
        const data = req.body //JSON.parse(JSON.stringify(req.body)) 
        const files = req.files
        const {password} = data
        // if(!validator.isValidObject(data)){
        //     return res.status(400).send ({status:false, message :"Please provide body"})
        // }
        const isUserExist = await userModel.findById(userId)
        if (!isUserExist){
            return res.status(404).send({status: false, message: "user not found"})
        }
        if(data._id){
            return res.status(400).send({status: false, message: "can not update user id"})
        }
        if(data.email){
            const isEmailInUse = await userModel.findOne({email: data.email})
            if(isEmailInUse) {
                return res.status(400).send({status:false, message: "email already registered, enter different email"})
            }
        }
        if(data.phone){
            const isPhoneInUse = await userModel.findOne({phone: data.phone})
            if(isPhoneInUse) {
                return res.status(400).send({status:false, message: "phone number already registered, enter different number"})
            }
        }
        if(files.length > 0){
            const link = await getProfileImgLink(req, res)
            data.profileImage = link
            // console.log(link)
        }
        if (password){
            const hash = await bcrypt.hash(password, salt)
            data.password = hash
        }
        const add = JSON.parse(JSON.stringify(isUserExist.address))
        // return res.send(add)
        if(data.address){
            data.address = JSON.parse(data.address)
            // return res.send(data)
            if(data.address.shipping){
                if(data.address.shipping.street){
                    if (!validator.isValid(data.address.shipping.street)){
                        return res.status(400).send({status: false, message: "please enter shipping street name"})
                    }
                    add.shipping.street = data.address.shipping.street
                }
                if(data.address.shipping.city){
                    if (!validator.isValid(data.address.shipping.city)){
                        return res.status(400).send({status: false, message: "please enter shipping city name"})
                    }
                    add.shipping.city = data.address.shipping.city
                }
                if(data.address.shipping.pincode){
                    if (!validator.isValid(data.address.shipping.pincode)){
                        return res.status(400).send({status: false, message: "please enter shipping pincode"})
                    }
                    add.shipping.pincode = data.address.shipping.pincode
                }
            }
            if(data.address.billing){
                if(data.address.billing.street){
                    if (!validator.isValid(data.address.billing.street)){
                        return res.status(400).send({status: false, message: "please enter billing street name"})
                    }
                    add.billing.street = data.address.billing.street
                }
                if(data.address.billing.city){
                    if (!validator.isValid(data.address.billing.city)){
                        return res.status(400).send({status: false, message: "please enter billing city name"})
                    }
                    add.billing.city = data.address.billing.city
                }
                if(data.address.billing.pincode){
                    if (!validator.isValid(data.address.billing.pincode)){
                        return res.status(400).send({status: false, message: "please enter billing pincode"})
                    }
                    add.billing.pincode = data.address.billing.pincode
                }
            }
            data.address = add
        }
        // return res.send(data.address)
        const updateUser = await userModel.findOneAndUpdate({_id: userId}, data, {new: true})
        return res.status(200).send({status: true, data: updateUser})
    }catch(error){
        return res.status(500).send({status: false, message: error.message})
    }
}


module.exports.register = register
module.exports.getUserProfile = getUserProfile;
module.exports.userlogin = userlogin
module.exports.updateUser = updateUser
