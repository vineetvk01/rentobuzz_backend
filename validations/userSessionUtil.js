const User = require('../models/users.model')
const UserSession = require('../models/userSession.model')

function allowIfAdmin(req,res){
    user = res.locals.user;
    if(!user){
        res.status(401).json({
            status:"failed",
            error:"Unauthorized",
            message:"Login or Token is required for API !"
        })
    }else{
        if(parseInt(user.Role)<3){
            res.status(401).json({
                status:"failed",
                error:"Unauthorized",
                message:"You are not an admin! Please login as Admin !"
            }) 
        }
    }
}

function allowIfLoggedIn(req,res){
    user = res.locals.user;
    if(!user){
        res.status(401).json({
            status:"failed",
            error:"Unauthorized",
            message:"Login or Token is required for API !"
        })
    }
}
function fetchUserFromSessionToken(sessionID,req,res,next){
    UserSession.findById(sessionID).then((usersession)=>{
        let userId = usersession.userId;
        if(!usersession.isActive){
            res.status(401).json({
                status:"failed",
                error:"Unauthorized",
                error: "Authorization: Ticket has been expired..",
            })
        }
        User.findById(userId).then((user)=>{
            let loggedInUser = user.toJSON()
            delete loggedInUser.password
            delete loggedInUser.__v
            res.locals.user = user
            next()
        }).catch((err)=>{
            res.status(400).json({
                message:"Bad Request",
                error: "Authorization: Invalid User Assigned to ticket..",
            })
        })   
    }).catch((err)=>{
        res.status(400).json({
            message:"Bad Request",
            error: "Authorization: Invalid Ticket",
        })
    })
}

module.exports = {fetchUserFromSessionToken,allowIfAdmin,allowIfLoggedIn}