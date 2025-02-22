let User = require('../models/users.model');
let UserSession = require('../models/userSession.model');
const userSessionUtil = require('../validations/userSessionUtil');
const router = require('express').Router();

// Only Admins
router.route('/clearallusersessions').delete((req, res) => {
	userSessionUtil.allowIfAdmin(req, res);
	UserSession.deleteMany({})
		.then((deleted) => {
			console.log(deleted);
			return res.status(202).json({
				status: success,
				message: 'All user sessions are cleared...'
			});
		})
		.catch((err) =>
			res.status(500).json({
				status: failure,
				message: 'Error while Deleting Session !',
				internalError: err
			})
		);
});

router.route('/validate/eligiblefororder/:username/:status').get((req, res) => {
	userSessionUtil.allowIfAdmin(req, res);
	let updateEligibility = { isEligibleForOrder: req.params.status };
	let username = req.params.username;
	console.log('Update Eligibility for user: ' + username);
	User.findOneAndUpdate({ userName: username }, { $set: updateEligibility })
		.then((data) => {
			console.log('Updated Eligibility');
			return res.status(202).json({
				status: 'success',
				message: 'Updated the eligibility'
			});
		})
		.catch(() => {
			res.status(404).json({
				status: 'failure',
				message: 'UserName not found'
			});
		});
});

module.exports = router;
