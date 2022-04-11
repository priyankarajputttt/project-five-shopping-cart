const jwt = require("jsonwebtoken")

const authentication = async function  (req, res , next)
{
    try {
    const token = req.headers["authorization"]
    // token avilablilty
    if(!token){
       return  res.status(400).send ({status:false, msg: "important header is missing"})
    }
    let decodedToken =jwt.verify(token , "projectfourgroup30")
    //check decoded Token
    if(!decodedToken){
        return  res.status(400).send ({status:false, message: "token is invalid"})
    }
    next()
    }
    catch (error){
      return res.status(500).send ({ status:false , message: error.message})
    } 
}

const userAuthorization = async function(req, res, next){
    let token = req.headers["authorization"];
    if(!token){
        return res.status(400).send("Plz enter a token")
    }
    let decodedToken = jwt.verify(token, "projectfourgroup30")
    let userId = req.params.userId;
    let DuserId = decodedToken.userId;
    if(!(validator.isValid(userId)) && (validator.isValidobjectId(userId))){
      return res.status(400).send("plz enter a valid userId")  
    }
    if(userId != DuserId){
        return res.status(403).send("You are not authorized")
    }
    next()
}

module.exports.userAuthorization = userAuthorization;
module.exports.authentication = authentication