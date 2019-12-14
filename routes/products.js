const router = require('express').Router();
let Product = require('../models/products.model');
let Orders = require('../models/orders.model');
const userSessionUtil = require('../validations/userSessionUtil');
const productValidationUtil = require('../validations/productValidationUtil');

const success = 'success';
const failure = 'failure';

// Guest
router.route('/:pid').get((req, res) => {
	console.log('Product: Product Lookup for id : ' + req.params.pid);
	Product.findById(req.params.pid)
		.then((product) => {
			if (product === null) {
				res.status(404).json({
					status: failure,
					error: 'Product is not found. Please check again'
				});
			}
			res.status(200).json(product);
		})
		.catch((err) => res.status(500).json(`Error: ${err}`));
});

router.route('/book/:pid').get((req, res) => {
	console.log('Product: Product Lookup');
	const { from_date, to_date, city } = req.body;
	Product.findById(req.params.pid)
		.then((product) => {
			Orders.find({ productId: product._id, cityOfBooking: city })
				.then((orders) => {
					const totalPrice = productValidationUtil.calculatePrice(product, orders, city, from_date, to_date);
					res.status(200).json({
						status: success,
						info: totalPrice
					});
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
			console.log('Product : Unable to lookup product ', err);
			res.status(500).json({
				status: failure,
				error: 'Product not found in the inventory'
			});
		});
});

router.route('/search/:query').get((req, res) => {
	var search_query = req.params.query;
	if (search_query.length < 1) {
		res.status(500).json(`Error: Not a valid search`);
	}
	Product.find({
		productName: { $regex: '.*' + search_query + '.*', $options: 'i' }
	})
		.then((product) => res.status(200).json(product))
		.catch((err) => res.status(500).json(`Error: ${err}`));
});

// Only For Admin

router.route('/').get((req, res) => {
	userSessionUtil.allowIfAdmin(req, res);
	Product.find().then((product) => res.json(product)).catch((err) => res.status(500).json(`Error: ${err}`));
});

router.route('/:pid').put((req, res) => {
	userSessionUtil.allowIfAdmin(req, res);
	const updateProduct = {
		productName: req.body.product_name,
		description: req.body.description,
		title: req.body.title,
		availableInCity: req.body.available_in_city,
		pricePerDay: req.body.price_per_day,
		basePrice: req.body.base_price,
		category: req.body.category
	};

	Product.findByIdAndUpdate(req.params.pid, updateProduct, { upsert: false })
		.then((product) =>
			res.status(202).json({
				status: success,
				message: 'id: ' + product._id
			})
		)
		.catch((err) => res.status(500).json(`Error: ${err}`));
});

router.route('/').post((req, res) => {
	userSessionUtil.allowIfAdmin(req, res);

	const newProduct = new Product({
		productName: req.body.product_name,
		description: req.body.description,
		title: req.body.title,
		availableInCity: req.body.available_in_city,
		pricePerDay: req.body.price_per_day,
		basePrice: req.body.base_price,
		category: req.body.category,
		securityDeposite: req.body.security_deposite
	});

	newProduct
		.save()
		.then((product) =>
			res.status(202).json({
				status: success,
				message: 'id: ' + product._id
			})
		)
		.catch((err) =>
			res.status(500).json({
				status: failure,
				message: 'Internal Server Error',
				internalError: err
			})
		);
});

module.exports = router;
