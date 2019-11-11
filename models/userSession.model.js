const mongoose = require('mongoose')

const UserSessionSchema = new mongoose.Schema({
    userId:{
        type: String,
        required: true
    },
    isActive:{
        type: Boolean,
        default: false,
    },
    ipaddr:{
        type: String,
        default:''
    },
},{
    timestamps:true,
})

module.exports = mongoose.model('UserSession', UserSessionSchema)