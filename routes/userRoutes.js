const express = require('express');
const router = express.Router();
const User = require('../models/user');
const {jwtAuthMiddleware,generateToken} = require('../jwt');
const log = require('node-gyp/lib/log');


router.post('/signup',async (req,res)=>{
    try {
        const data = req.body;  // data given in body
    
        const newUser = new User(data); // creating new user 
    
        const response = await newUser.save();
       
        console.log("data saved");
        
        const payload = {
            id: response.id,
            name: response.name
        }
        console.log(JSON.stringify(payload));
        const token = generateToken(payload);
        console.log("token is " ,token);
    
        res.status(200).json({response: response,token:token})
     
    } catch (error) {
        console.log(error);
         res.status(500).json({error:"internal server Error"})
    }
    
})

router.get('/login',async (req,res)=>{
   try {
     //extract aadharCardNumber and pass from req body
     const {aadharCardNumber,password} = req.body;

     //find user by aadharCard
     const user = User.findOne({aadharCardNumber:aadharCardNumber});

     //if user or password is wrng
     if(!user || (await user.comparePassword(password))){
        return res.status(401).json({error:"Invalid user or password"});
     }

     //generate token
     const payload = {
        id: user.id
    }
    const token = generateToken(payload);
    
    res.json(token);

   } catch (error) {
    console.log(error);
    res.status(500).json({error:"internal server Error"})
   }
});

router.get('/profile',jwtAuthMiddleware,async (req,res)=>{
    try {
        const userData = req.user;
        const userId = userData.id;
        const user = await User.findById(userId);

        res.status(200).json({user});

    } catch (error) {
        console.log(error);
        res.status(500).json({error: 'Internal Server Error'})
    }
})

router.put('/profile/password',jwtAuthMiddleware,async (req,res)=>{
    try {
        const userId = req.user.id; //extract id from token
        const {currentPassword,newpassword} = req.body; //extract currentPassword,newpassword from body
        
        //find the user by userid
        const user =await User.findById(userId);

        //passwordMatch
        if(!(await user.comparePassword(currentPassword))){
            return res.status(401).json({error:"Invalid  password"});
         }
       
         user.password = newpassword;
         await user.save();
         console.log('password updated');
         res.status(200).json({message: 'password updated'})

    } catch (error) {
        console.log(error);
        res.status(500).json({error: 'Internal Server Error'})
    }
})

module.exports = router;