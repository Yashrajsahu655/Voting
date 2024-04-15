const express = require('express');
const app = express();
const dotenv = require('dotenv').config;
const mongoose = require('mongoose');
const UserRouter = require('./routes/userRoutes')
const CandidateRouter = require('./routes/candidateRoutes');
const {generateToken,jwtAuthMiddleware} = require('./jwt')

mongoose.connect('mongodb://127.0.0.1:27017/Election');
const bodyparser = require('body-parser');
app.use(bodyparser.json()); 


app.use('/user',UserRouter);
app.use('/candidate',CandidateRouter);


const PORT = process.env.PORT || 3000;

app.listen(PORT,console.log(`listening on ${PORT}`));