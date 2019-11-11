const express =  require('express')
const cors = require('cors')
const mongoose = require('mongoose')

const userSessionUtil = require('./validations/userSessionUtil')

require('dotenv').config()

const app = express();
const port = process.env.PORT || 5000
const NODE_ENV = process.env.NODE_ENV || 'development'
const uri = process.env.ATLAS_URI
const auth_preToken = process.env.PRE_TOKEN || "basic"

//const SESS_LIFETIME = process.env.SESS_LIFETIME || 2*60*60*1000
//const SESS_NAME = process.env.SESS_NAME || 'sid'
//const SESS_SECRET = process.env.SESS_NAME || 'iamsessionsecret'


const IN_PROD = NODE_ENV === 'production'

mongoose.connect(uri, 
    { useNewUrlParser: true,
      useCreateIndex:true, 
      useUnifiedTopology: true
    } ).catch((error) =>{
        console.log(`Unable to connect ${error}`)
    })
const connection = mongoose.connection
connection.once('open', () =>{
    console.log("MongoDB database is connected successfully...")
})

app.use(cors());
app.use(express.json())

app.use((req,res,next)=>{
    const { authorization} = req.headers
    if(authorization){
        const session_token = authorization.split(' ')
        if(session_token[0] == auth_preToken){
            userSessionUtil.fetchUserFromSessionToken(session_token[1],req,res,next)
        }
    }else{
        next()
    }
})

const usersRouter = require('./routes/users')

const api_v1 = '/api/v1'
app.use(api_v1+'/users', usersRouter)

app.listen(port, ()=> {
    console.log(`Server is running on port: ${port}`)
})