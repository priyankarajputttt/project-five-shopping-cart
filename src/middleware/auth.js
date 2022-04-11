let userAuthorization = async function(req,res,next){
    let token = req.headers["Authorization"];
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
