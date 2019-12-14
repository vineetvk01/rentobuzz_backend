const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Schema = mongoose.Schema;

const userSchema = new Schema(
	{
		firstName: {
			type: String,
			required: true,
			unique: false,
			trim: true,
			minlength: 4
		},
		lastName: {
			type: String,
			required: true,
			unique: false,
			trim: true,
			minlength: 4
		},
		email: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			minlength: 4
		},
		phoneNumber: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			minlength: 6
		},
		userName: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			minlength: 3
		},
		password: {
			type: String,
			required: true,
			minlength: 4
		},
		isVerifiedEmail: {
			type: Boolean,
			default: false
		},
		isVerifiedPhone: {
			type: Boolean,
			default: false
		},
		isEligibleForOrder: {
			type: Boolean,
			default: false
		},
		Role: {
			type: Number,
			default: 1,
			minlength: 1
		},
		OTPs: {
			type: Object,
			required: false
		}
	},
	{
		timestamps: true
	}
);

userSchema.methods.generateHash = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPasswordDB = function(password) {
	return bcrypt.compareSync(password, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
