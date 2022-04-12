const userModel = require("../model/userModel")
const validator = require("../validator/validator")
const aws = require("./aws")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")

const salt = 10

const register = async (req, res) => {
    try{
        // const data1 = req.body.data;
        
        // const data = JSON.parse(data1)
        const data = req.body
        if (!validator.isValidObject(data)){
            return res.status(400).send({status: false, message: "please fill all required fields"})
        }
        const{fname, lname, email, phone, password, address} = data
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
        bcrypt.hash(password, salt, (err, result) => {
            if(result){
                data.password = result
            }
        })
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
            return res.status(400).send({ msg: "No file found" })
        }
    }catch(error){
        return res.status(500).send({status: false, message: error.message })
    }
}


const updateUser = async function(req,res){
    try{ 
        const userId = req.params.userId
        
        const data = req.body

     
        if (!validator.isValidObjectId(userId)){
            return res.status(400).send({status: false, message: "Invalid UserId"})
        }
       
        const checkUserIdExist = await userModel.findOne({ _id: userId})
        if (!checkUserIdExist) {
            return res.status(404).send({ status: false, msg: "userId does not exist" })
        }

        if (!validator.isValidObject(data)){
            return res.status(400).send({status: false, message: "please fill the field"})
        } 

        const  {fname, lname, email, profileImage, phone, password, address} = data

        const{billing, shipping } = data

        let updatedData = {}

        if(fname){
            if(!validator.isValid(fname)){
                return res.status(400).send({status: false, message: "please enter first name"})
            }
        
            updatedData['fname'] = fname

        }
        if(lname){
            if(!validator.isValid(lname)){
                return res.status(400).send({status: false, message: "please enter last name"})
            }
            updatedData['lname'] = lname

        }
        if(email){
            if(!validator.isValid(email)){
                return res.status(400).send({status: false, message: "please enter email"})
            }
            updatedData['email'] = email

        }
        if(profileImage){
            if(!validator.isValid(profileImage)){
                return res.status(400).send({status: false, message: "please enter profileImage"})
            }
            updatedData['profileImage'] = profileImage

        }
        if(phone){
            if(!validator.isValid(phone)){
                return res.status(400).send({status: false, message: "please enter phone"})
            }
            updatedData['phone'] = phone

        }
        if(password){
            if(!validator.isValid(email)){
                return res.status(400).send({status: false, message: "please enter email"})
            }
            updatedData['password'] = password

        }
        if(address){
            if(!validator.isValid(address)){
                return res.status(400).send({status: false, message: "please enter address"})
            }
            updatedData['address'] = address

        }
        if(billing){
            if(!validator.isValid(billing)){
                return res.status(400).send({status: false, message: "please enter billing"})
            }
            updatedData['billing'] = billing  

        }
        if(shipping){
            if(!validator.isValid(shipping)){
                return res.status(400).send({status: false, message: "please enter shipping"})
            }
            updatedData['shipping'] = shipping
        }

    let updatedUserDetails = await userModel.findOneAndUpdate({ _id: userId }, { $set: updatedData }, { new: true })
    return res.status(200).send({ status: true, message: "Data updated succesfully", data: updatedUserDetails })
        



    } catch (error){
        return res.status(500).send({ERROR:error.message})
    }

}

const updateUser1 = async (req, res) => {
    try{
        const {userId} = req.params
        if (!validator.isValidObjectId(userId)){
            return res.status(400).send ({status:false, message :"Please provide body"})
        }
        const data = req.body//JSON.parse(JSON.stringify(req.body))
        const {password} = data
        if(!validator.isValidObject(data)){
            return res.status(400).send ({status:false, message :"Please provide body"})
        }
        const isUserExist = await userModel.findById(userId)
        if (!isUserExist){
            return res.status(404).send({status: false, message: "user not found"})
        }
        if(data._id){
            return res.status(400).send({status: false, message: "can not update user id"})
        }
        if (password){
            bcrypt.hash(password, salt, (err, result) => {
                if(result){
                    data.password = result
                    console.log(data.password)
                }
            })
        }
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
module.exports.updateUser1 = updateUser1