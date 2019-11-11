const router = require('express').Router()
let User = require('../models/users.model')
let UserSession = require('../models/userSession.model')

const signUpValidations = require('../validations/validations')
const userSessionUtil = require('../validations/userSessionUtil')

const success = 'success'
const failure = 'failure'

function isUserNameAvailable(userArray){
    if(userArray.length>0) return false
    return true
}

async function loginUser(users, password,req,res){
    var response = {status: failure};
    if(users.length>0){
        if(users.length==1){
            const user = users[0]
            if(user.validPasswordDB(password)){
                const userSession = new UserSession({
                    userId : user._id,
                    isActive : true
                })
                userSession.save()
                .then(function(userSession){
                    res.status(200).json({
                        status: success,
                        ticket:userSession._id
                    })
                })
                .catch(err => (response = {
                    status: failure,
                    message:'Error while Loging In',
                    internalError: err
                }))
            }else{
                return{
                    status: failure,
                    message : 'Invalid Password Entered !',
                }
            }
        }else{
            return{
                status: failure,
                message : 'Internal Server Error',
                internalError : 'More than 1 user exists in DB' 
            } 
        }
    }else{
        return{
            status: failure,
            message : 'Wrong Email/Username!'
        }
    }
}

// Only For Admin
router.route('/').get((req,res) => {
    userSessionUtil.allowIfAdmin(req,res)
    
    User.find()
    .then(user => res.json(user))
    .catch(err => res.status(500).json(`Error: ${err}`))
})

// For LoggedIn Users

// For AnyUser
router.route('/usernameavailable').get((req,res) => {
    let reqUserName = req.query.username
    User.find({userName: reqUserName})
    .then(user => res.json({
        status: success,
        isAvailable: isUserNameAvailable(user)
    }))
    .catch(err => res.status(500).json({
        status: failure,
        message:'Error while fetching user !',
        internalError: err
    }))
})

router.route('/login').post((req,res) =>{
    const credential = req.body.email;
    const password = req.body.password;
    
    var error = signUpValidations.validateEmail(credential)
    if(error != ""){
        console.log("Its no email")
        error = signUpValidations.validateUserName(credential) 
        if(error!= ""){
            res.status(400).json({
                status: failure,
                message: 'Bad Request'
            }) 
        }else{
            console.log("Its username")
            User.find({userName: credential}).then(user => loginUser(user, password,req,res))
            .catch(err => res.status(500).json({
                status: failure,
                message:'Error while fetching userName !',
                internalError: err
            }))
        }
    }else{
        console.log("Its email")
        User.find({email: credential}).then(user => loginUser(user,password,req,res))
        .catch(err => res.status(500).json({
            status: failure,
            message:'Error while fetching Email !',
            internalError: err
        }))
    }
})

router.route('/register').post((req,res) =>{
    const firstName = req.body.firstname;
    const lastName = req.body.lastname;
    const email = req.body.email;
    const phoneNumber = req.body.phonenumber;
    const userName = req.body.username;
    const password = req.body.password;

    let errors =[]
    errors.push(signUpValidations.validateName(firstName))
    errors.push(signUpValidations.validateName(lastName))
    errors.push(signUpValidations.validateEmail(email))
    errors.push(signUpValidations.validatePhoneNumber(phoneNumber))
    errors.push(signUpValidations.validateUserName(userName))
    errors.push(signUpValidations.validatePassword(password))
    errors = errors.filter((error)=> error.length>1)
    if(errors.length>0){
        res.status(400).json({
            status: failure,
            message: errors
        })
    }
    

    const newUser = new User(
        {firstName : firstName,
        lastName : lastName,
        email:email,
        phoneNumber:phoneNumber,
        userName:userName}
    )
    newUser.password = newUser.generateHash(password)
    newUser.save()
    .then(()=> res.json({
        status: success,
        message:'Signup is successfull. Thanks for Registering with us.',
    }))
    .catch(err => res.status(400).json({
        status: failure,
        message:'Error while saving User !',
        internalError: err
    }))
})

module.exports = router