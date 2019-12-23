function isAvailableInDates(from_date, to_date, orders, availableInCity) {
	if (orders.length < 1) {
		return true;
	}
	return false;
}

function calculatePriceFromDays(product, totalDays) {
	let priceToBeCharged = product.basePrice;
	console.log('calculatePriceFromDays : Base Price : ' + priceToBeCharged);
	console.log(
		'calculatePriceFromDays : Number of Division of price for this product : ' +
			Object.keys(product.pricePerDay).length
	);
	Object.keys(product.pricePerDay).forEach(function(key) {
		console.log(
			'calculatePriceFromDays : More than Day : ' + key + ' | Price per day: ' + product.pricePerDay[key]
		);
		if (parseInt(totalDays) >= parseInt(key)) {
			console.log(
				'calculatePriceFromDays : As days are more than ' +
					key +
					' will be charged at ' +
					product.pricePerDay[key]
			);
			priceToBeCharged = parseInt(product.pricePerDay[key]);
		}
	});
	console.log(' Requested : TOTAL DAYS: ' + totalDays);
	console.log(' Requested : price To be charged per day ' + priceToBeCharged);
	return priceToBeCharged * totalDays;
}
function calculatePrice(product, orders, city, from_date, to_date) {
	let productID = product._id;
	let fromDate = new Date(from_date);
	let toDate = new Date(to_date);
	let totalDays = (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24);
	if (totalDays < 0) {
		throw new Error('Drop Off date is before Pickup Date');
	}
	console.log('calculatePrice : Dates are entered correctly in apis ');
	let availableInCity = product.availableInCity[city];
	//Checking whether the product is available in the required city at the moment
	if (availableInCity < 1) {
		throw new Error('Not Available in ' + city);
	}
	console.log('calculatePrice : Product Available in ' + city);
	if (orders.length > 0) {
		//Checking for dates from orders intersection
		console.log('calculatePrice : Total orders for the product' + orders.length);
		if (!isAvailableInDates(from_date, to_date, orders, availableInCity)) {
			console.log('calculatePrice : Product Already booked for these days in this city ! ');
			throw new Error('Sorry! Booked for these days in ' + city);
		}
		console.log('calculatePrice : No Intersection with dates of other orders');
	}
	// After Validations | Calculating Price
	var priceToPay = calculatePriceFromDays(product, totalDays);
	console.log('Price to pay calculated : ' + priceToPay);
	return {
		total_days: totalDays,
		price_to_pay: priceToPay,
		per_day_price: priceToPay / totalDays
	};
}

function isUserEligibleForOrdering(user) {
	let { _id, email, isVerifiedEmail, isVerifiedPhone, isEligibleForOrder } = user;
	console.log(
		'Order Request by : ' +
			email +
			' \n --- \nProfile Details : \nEmail Verified : ' +
			isVerifiedEmail +
			' \nPhone Number Verified: ' +
			isVerifiedPhone +
			' \nOrder Eligible: ' +
			isEligibleForOrder +
			'\n---'
	);
	if (!isVerifiedEmail) {
		return {
			status: false,
			error: 'Email is not verified'
		};
	}
	if (!isVerifiedPhone) {
		return {
			status: false,
			error: 'Phone Number is not verified'
		};
	}
	if (!isEligibleForOrder) {
		return {
			status: false,
			error: 'KYC is not done yet'
		};
	}
	return {
		status: true
	};
}

module.exports = { calculatePrice, isUserEligibleForOrdering };
