const mongoose = require('mongoose')
const dbConection = require('../module/dbConnection')
const bcrypt = require('bcrypt')
const validateEmail = function (email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email);
  };
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        validate: [ validateEmail, "please fill a valid email"],
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address",
        ]
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: true,
        validate: {
            validator: function(el){
                return el === this.password
            },
            message: "Passwords are not same "
        }
    }
})

UserSchema.pre("save", async function(next){
    //Only run this function if password was actually modified
    if(!this.isModified("password")) return next()

    //hash the password with 12
    this.password = await bcrypt.hash(this.password, 12)

    this.passwordConfirm = undefined
})

UserSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword)
}

module.exports = mongoose.model('User', UserSchema)