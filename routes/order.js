const router = require('express').Router();
let Orders = require('../models/orders.model');
let Product = require('../models/products.model');
const userSessionUtil = require('../validations/userSessionUtil');
const productValidationUtil = require('../validations/productValidationUtil');

const success = 'success';
const failure = 'failure';

// User
router.route('/:oid').get((req, res) => {
	userSessionUtil.allowIfLoggedIn(req, res);
	Orders.find({ _id: req.params.oid })
		.then((order) => res.status(200).json(order))
		.catch((err) => res.status(500).json(`Error: ${err}`));
});

router.route('/new/:pid').post((req, res) => {
	userSessionUtil.allowIfLoggedIn(req, res);
	const { from_date, to_date, city } = req.body;
	var user = res.locals.user;
	console.log(
		'Order | order received, user: ' +
			user.email +
			' product :' +
			req.params.pid +
			' ::: From: ' +
			from_date +
			' , To: ' +
			to_date +
			', city: ' +
			city
	);
	// Check whether the User is eligible for booking
	let eligibityStatus = productValidationUtil.isUserEligibleForOrdering(user);
	console.log('Order user Eligibity of ordering : ' + eligibityStatus);

	if (!eligibityStatus.status) {
		res.status(403).json({
			status: failure,
			error: eligibityStatus.error
		});
	}
	// Check whether product is available at the location
	Product.findById(req.params.pid)
		.then((product) => {
			Orders.find({ productId: product._id, cityOfBooking: city })
				.then((orders) => {
					const totalPrice = productValidationUtil.calculatePrice(product, orders, city, from_date, to_date);
					if (totalPrice > 0) {
						res.status(200).json({
							status: success
						});
					}
				})
				.catch((err) => {
					console.log('Product : Unable to lookup orders ', err);
					res.status(500).json({
						status: failure,
						error: err.message
					});
				});
		})
		.catch((err) => {
			console.log('Product : Unable to lookup Product ', err);
			res.status(400).json({
				status: failure,
				error: 'Product is not available in the inventory'
			});
		});
});

//Admin
router.route('/').get((req, res) => {
	userSessionUtil.allowIfAdmin(req, res);
	console.log('Orders | Requesting all the orders by: ' + res.locals.user.userName);
	Orders.find().then((orders) => res.status(200).json(orders)).catch((err) => res.status(500).json(`Error: ${err}`));
});

module.exports = router;
