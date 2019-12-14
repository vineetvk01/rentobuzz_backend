const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ProductsSchema = new Schema(
	{
		productName: {
			type: String,
			required: true,
			unique: false,
			trim: true
		},
		description: {
			type: String,
			required: true,
			unique: false,
			trim: true
		},
		title: {
			type: String,
			required: true,
			unique: false,
			trim: true
		},
		category: {
			type: String,
			required: true,
			enum: [ 'camera', 'business', 'adventure' ],
			default: 'camera',
			unique: false,
			trim: true
		},
		productImages: {
			type: Array,
			required: false,
			unique: false
		},
		userComments: {
			type: Array,
			required: false
		},
		availableInCity: {
			type: Object,
			required: true
		},
		pricePerDay: {
			type: Object,
			required: false
		},
		basePrice: {
			type: Number,
			required: true
		},
		securityDeposite: {
			type: Number,
			required: true
		}
	},
	{
		timestamps: true
	}
);

module.exports = mongoose.model('Products', ProductsSchema);
