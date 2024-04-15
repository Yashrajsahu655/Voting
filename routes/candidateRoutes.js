const Candidate = require('../models/candidate');
const express = require('express');
const User = require('../models/user');
const { json } = require('body-parser');
const router = express.Router();
const {generateToken,jwtAuthMiddleware} = require('../jwt')

const isAdmin = async(userId)=>{
  try {
     const user = await User.findById(userId);
     return user.role ==='admin';
  } catch (error) {
     return false;
  }
}

router.post('/',jwtAuthMiddleware,async (req,res)=>{

   if(await isAdmin(req.user.id) == false){
   return res.status(403).json({message:"user has not admin access"});
   }

     try {
        const candidateData = req.body;

        const newCandidate = new Candidate(candidateData);
        const response = await newCandidate.save();
        console.log('data saved');

        res.status(201).json({candidate:response})
     } catch (error) {
        res.status(501).json({error:'Internal server error'})
     }
})

router.put('/:candidateId',jwtAuthMiddleware,async (req,res)=>{
    if(await isAdmin(req.user.id) == false){
        return res.status(403).json({message:"user has not admin access"});
        }
     const candidateId = req.params.candidateId;

     try {
        const data = req.body;
        const updatedUser = await Candidate.findByIdAndUpdate(candidateId,data,{
            new:true,   //return the updated docs
            runValidators:true //run the moongoose validation
        })

        if(!updatedUser) res.status(404).json({error:'candidate not found'})
        
        res.status(200).json(updatedUser);
     } catch (error) {
        res.status(501).json({error:'Internal server error'})
     }

})

router.delete('/:candidateId',jwtAuthMiddleware,async (req,res)=>{

    if(await isAdmin(req.user.id) == false){
        return res.status(403).json({message:"user has not admin access"});
        }

     const candidateId = req.params.candidateId;

     try {
        
        const response = await Candidate.findByIdAndDelete(candidateId)
        if(!response) res.status(404).json({error:'candidate not found'})
        
        res.status(200).json(response);
     } catch (error) {
        res.status(501).json({error:'Internal server error'})
     }

})

router.post('/vote/:candidateId',jwtAuthMiddleware,async(req,res)=>{
    //user can vote only once
    //admin cant vote
    const candidateId = req.params.candidateId;
    const userId = req.user.id;

    try {
       

        //finding candidate
        const candidate = await  Candidate.findById(candidateId);
        if(!candidate) return res.status(404).json({message:"candidate not found"});
        
        //finding user
        const user = await User.findById(userId);
        if(!user) return res.status(404).json({message:"user not found"});

        if(user.role === 'admin') return res.status(403).json({message:"Admin can't vote"});

        
        if(user.isVoted) return res.status(404).json({message:"You can vote only once"});

      //update the candidate
         candidate.votes.push({user:userId})
         candidate.voteCount++;
         await candidate.save();

         //update the user
         user.isVoted = true;
         await user.save();

         res.status(200).json({message:"Voted successfully"})

        
    } catch (error) {
        console.log(error);
        res.status(501).json({error:error})
    }
})

router.get('/vote/count',async (req,res)=>{
    try {
       
        const candidate = await Candidate.find();

       const VoteRecord = candidate.map((data)=>{
            return {
                party:data.party,
                count:data.voteCount
            }
       })

        res.status(200).json(VoteRecord);

    } catch (error) {
        console.log(error);
        res.status(501).json({error:error})
    }
})

router.get('/candidateList',async (req,res)=>{
    try {
        const candidate = await Candidate.find();
   
        const candidatesName = candidate.map((data)=>{
            return {
                name:data.name
            }
       })

       res.status(200).json(candidatesName)


    } catch (error) {
        console.log(error);
        res.status(501).json({error:error})
    }
})

module.exports = router;

