const router = require('express').Router();
let Orders = require('../models/orders.model');
let Product = require('../models/products.model');
const userSessionUtil = require('../validations/userSessionUtil');
const productValidationUtil = require('../validations/productValidationUtil');

const success = 'success';
const failure = 'failure';

// User
router.route('/details/:oid').get((req, res) => {
	userSessionUtil.allowIfLoggedIn(req, res);
	Orders.find({ _id: req.params.oid })
		.then((order) => res.status(200).json(order))
		.catch((err) => res.status(500).json(`Error: ${err}`));
});

//Make a new order
router.route('/new/:pid').post((req, res) => {
	userSessionUtil.allowIfLoggedIn(req, res);
	const { from_date, to_date, city, address_deliver, address_billing } = req.body;
	const user = res.locals.user;
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
	console.log('Order user Eligibity of ordering : ' + eligibityStatus.status);

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
					if (totalPrice.price_to_pay > 0) {
						const newOrder = new Orders({
							productId: product._id,
							userId: user.id,
							cityOfBooking: city,
							pickupDate: from_date,
							dropOffDate: to_date,
							addressDeliver: address_deliver,
							billingAddress: address_billing,
							totalPrice: totalPrice.price_to_pay,
							billingPrice: totalPrice.price_to_pay
						});
						newOrder
							.save()
							.then((data) => {
								console.log('Order placed guys : ' + error);
								return res.status(202).json({
									status: success,
									order: data
								});
							})
							.catch((error) => {
								console.log('Error while placing order : ' + error);
								return res.status(500).json({
									status: failure
								});
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
