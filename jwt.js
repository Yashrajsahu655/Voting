const jwt = require('jsonwebtoken');
const { decode } = require('punycode');

const JWT_SECRET = 12345;
const jwtAuthMiddleware= (req,res,next)=>{

    //first check req has authorization or not
    const authorization = req.headers.authorization;

    if(!authorization) return res.status(401).json({error: "token not found"});

    //extract the jwt token from req header
    const token = req.headers.authorization.split(' ')[1];
    if(!token) return res.status(401).json({error: "Unauthorized"});

    try {
        //verify token
        const decoded=jwt.verify(token,'JWT_SECRET');
        console.log(decoded);
        //attach user info to the req obj 
        req.user = decoded;
        next();
        
    } catch (error) {
        console.log(error);
        return res.status(401).json({error: "Invalid token"});
    }
}

const generateToken = (userData)=>{
    return jwt.sign(userData,'JWT_SECRET');
}


module.exports = {jwtAuthMiddleware,generateToken}
