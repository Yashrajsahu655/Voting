const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')

const userSchema = mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    age:{
        type:Number,
        required: true
    },
    email:{
        type:String,
    },
    mobile:{
        type: String
    },
    address:{
        type:String,
        required: true
    },
    aadharCardNumber:{
        type:Number,
        required: true,
        unique: true
    },
    password:{
        type:String,
        required: true
    },
    role:{
        type: String,
        enum: ['voter','admin'],
        default: 'voter'
    },
   

    isVoted:{
      type: Boolean,
      default: false
    },

});



userSchema.pre('save',async function(next){
    const person = this;

    //hash the password only if it has changed

    if(!person.isModified('password')) return next();

    try {
        //creating salt
        const salt = await bcrypt.genSalt(10);
         
        //hash password
        const hashedPassword = await bcrypt.hash(person.password,salt);
        
        //overRide the plain password with hash
        person.password = hashedPassword;
        next();

    } catch (error) {
        return next(error);
    }
})




userSchema.methods.comparePassword = async function(userPassword){
     try {
          const isMatch = await bcrypt.compare(userPassword,this.password);
          return isMatch;
     } catch (error) {
         throw error;
     }
}




const User = mongoose.model('user',userSchema);

module.exports = User;