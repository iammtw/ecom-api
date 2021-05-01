const jwt = require('jsonwebtoken');

function auth (req,res,next){
    const token = req.header('auth-token');
    if(!token){
        return res.status(201).send("Access Denied"); 
    }
    try {
        const verified = jwt.verify(token, process.env.secret);
        req.user = verified;
    } catch (error) {
        res.status(400).send("Invalid Token");
    }
    next()
}

function adminRole (req,res,next){
    if(req.user){
        if(!req.user.isAdmin){
            return res.status(401).send("Forbidden!");
        } 
        next();
    } else {
        res.status(401).send({ message: 'Please Login first' })
    }
}


module.exports = {
    auth,
    adminRole
}