const router = require('express').Router();
let User = require('../models/users.model');
let UserSession = require('../models/userSession.model');

const signUpValidations = require('../validations/validations');
const userSessionUtil = require('../validations/userSessionUtil');
const mailUtil = require('../validations/mailUtil');

const success = 'success';
const failure = 'failure';

function isUserNameAvailable(userArray) {
	if (userArray.length > 0) return false;
	return true;
}

function loginUser(users, password, req, res) {
	console.log('LoginUser | loggin user');
	var response = { status: failure };
	if (users.length > 0) {
		if (users.length == 1) {
			const user = users[0];
			if (user.validPasswordDB(password)) {
				const userSession = new UserSession({
					userId: user._id,
					isActive: true,
					userAgent: req.get('User-Agent')
				});
				userSession
					.save()
					.then(function(userSession) {
						let loginNotificationMail = {
							to: user.email,
							subject: 'We Have indentified a login from your credential',
							text: ' Login Occured',
							html:
								'<h1>Welcome ' +
								user.firstName +
								' ' +
								user.lastName +
								'</h1><p>Welcome back to Rentobuzz. We have identified a login from your account.<br> <b>Using</b> : ' +
								userSession.userAgent +
								' <br><b>At Time: </b>' +
								userSession.updatedAt +
								' </p>'
						};
						mailUtil.sendMailNow(loginNotificationMail).catch((error) => {
							console.log('Error While Sending mail, Error : ', error);
						});
						res.cookie('ticket', userSession._id, { httpOnly: true });
						res.status(200).json({
							status: success,
							ticket: userSession._id
						});
					})
					.catch(
						(err) =>
							(response = {
								status: failure,
								message: 'Error while Loging In',
								internalError: err
							})
					);
			} else {
				return {
					status: failure,
					message: 'Invalid Password Entered !'
				};
			}
		} else {
			return {
				status: failure,
				message: 'Internal Server Error',
				internalError: 'More than 1 user exists in DB'
			};
		}
	} else {
		return {
			status: failure,
			message: 'Wrong Email/Username!'
		};
	}
}

// Only For Admin
router.route('/').get((req, res) => {
	userSessionUtil.allowIfAdmin(req, res);
	User.find().then((user) => res.json(user)).catch((err) => res.status(500).json(`Error: ${err}`));
});

// For LoggedIn Users

router.route('/user/verifyemail/:eid/:otp').get((req, res) => {
	console.log('Veryfying email for the users');
	userSessionUtil.allowIfLoggedIn(req, res);
	const user = res.locals.user;
	if (user !== undefined) {
		console.log('User Logged In and Current emai staus : ' + user.isVerifiedEmail);
		let email = user.email;
		console.log('EMAIL request Logged In :' + email);
		if (email === req.params.eid) {
			const oTP = req.params.otp;
			console.log('OTP request Logged In :' + email);
			if (!Number.isInteger(parseInt(oTP))) {
				return res.status(403).json({
					status: failure,
					message: 'Invalid OTP. Please check the OTP.'
				});
			} else {
				const oTPForUser = user.OTPs.emailOTP;
				if (oTP == oTPForUser) {
					let updateVerification = { isVerifiedEmail: true };
					console.log('User.ID going to update -> ' + user._id);
					User.findByIdAndUpdate(user._id, { $set: updateVerification })
						.then((data) => {
							console.log(data);
							return res.status(200).json({
								status: success,
								message: 'Email is verified successfully'
							});
						})
						.catch((data) => {
							res.status(500).json({
								status: failure,
								message: 'Try again later'
							});
						});
				}
			}
		}
	}
});

router.route('/user/verifyphone/:pno/:otp').get((req, res) => {
	console.log('Veryfying Phone Number for the users');
	userSessionUtil.allowIfLoggedIn(req, res);
	const user = res.locals.user;
	if (user !== undefined) {
		console.log('User Logged In and Current PhoneNumber staus : ' + user.isVerifiedPhone);
		let phoneNumber = user.phoneNumber;
		console.log('EMAIL request Logged In :' + phoneNumber);
		if (phoneNumber === req.params.pno) {
			const oTP = req.params.otp;
			console.log('Logged In User :' + user.email);
			if (!Number.isInteger(parseInt(oTP))) {
				return res.status(403).json({
					status: failure,
					message: 'Invalid OTP. Please check the OTP.'
				});
			} else {
				const oTPForUser = user.OTPs.phoneOTP;
				console.log('OTP for the user in DB :' + oTPForUser);
				if (oTPForUser == undefined) {
					return res.status(404).json({
						status: failure,
						message: 'OTP not setup for your account. Please contact support'
					});
				}
				if (oTP == oTPForUser) {
					let updateVerification = { isVerifiedPhone: true };
					console.log('User.ID going to update -> ' + user._id);
					User.findByIdAndUpdate(user._id, { $set: updateVerification }, { new: true })
						.then((data) => {
							console.log(data);
							return res.status(200).json({
								status: success,
								message: 'Phone Number is verified successfully'
							});
						})
						.catch((data) => {
							res.status(500).json({
								status: failure,
								message: 'Try again later'
							});
						});
				}
			}
		}
	}
});

router.route('/logout').get((req, res) => {
	console.log('Logout | Logout Request ');
	userSessionUtil.allowIfLoggedIn(req, res);
	let sessionId = res.locals.sessionId;
	let updateSession = { isActive: false };
	UserSession.findByIdAndUpdate(sessionId, { $set: updateSession })
		.then(() => {
			console.log('Logout | Updated the Session Details ');
			res.cookie('ticket', '--', { httpOnly: true, expires: new Date() });
			console.log('Logout | Cleared Client Cookie ');
			res.status(200).json({
				status: success,
				message: 'Logged Out Successfully...'
			});
			return;
		})
		.catch((err) => {
			console.log('Logout | Error while log out of user');
			res.status(500).json({
				status: failure,
				message: 'Please contact support'
			});
		});
});

router.route('/user/:uid').get((req, res) => {
	userSessionUtil.allowIfLoggedIn(req, res);
	const userInSession = res.locals.user;
	if (userInSession._id === req.params.uid) {
		console.log('Current User Accessing his data' + userInSession.email);
	} else {
		userSessionUtil.allowIfAdmin(req, res);
		console.log('Admin is accesssing user data | AdminInfo : ' + userInSession.email);
	}
	User.findById(req.params.uid).then((user) =>
		res.status(200).json({
			status: success,
			user: user
		})
	);
});

router.route('/user/:uid').put((req, res) => {
	userSessionUtil.allowIfLoggedIn(req, res);
	const firstName = req.body.firstname;
	const lastName = req.body.lastname;
	const email = req.body.email;
	const phoneNumber = req.body.phonenumber;
	const userName = req.body.username;
	const userInSession = res.locals.user;
	let errors = [];
	if (userInSession._id === req.params.uid) {
		console.log('Users | User is updating his data | UserInfo : ' + userInSession.email);
	} else {
		userSessionUtil.allowIfAdmin(req, res);
		console.log('Users | Admin is updating his data | AdminInfo : ' + userInSession.email);
	}
	errors.push(signUpValidations.validateName(firstName));
	errors.push(signUpValidations.validateName(lastName));
	errors.push(signUpValidations.validateEmail(email));
	errors.push(signUpValidations.validatePhoneNumber(phoneNumber));
	errors.push(signUpValidations.validateUserName(userName));
	errors = errors.filter((error) => error.length > 1);
	if (errors.length > 0) {
		console.log('Users | Error while updating ' + errors.toString);
		res.status(400).json({
			status: failure,
			message: errors
		});
	}

	const updatedUser = {
		firstName: firstName,
		lastName: lastName,
		email: email,
		phoneNumber: phoneNumber,
		userName: userName
	};
	User.findByIdAndUpdate(req.params.uid, updatedUser, { upsert: false, new: true })
		.then((user) =>
			res.status(200).json({
				status: success,
				message: user
			})
		)
		.catch((err) => {
			console.log('Error while updating users : ' + err);
			res.status(400).json({
				status: failure,
				error: err.message
			});
		});
});

// Guest
router.route('/usernameavailable').get((req, res) => {
	let reqUserName = req.query.username;
	User.find({ userName: reqUserName })
		.then((user) =>
			res.status(200).json({
				status: success,
				isAvailable: isUserNameAvailable(user)
			})
		)
		.catch((err) =>
			res.status(500).json({
				status: failure,
				message: 'Error while fetching user !',
				internalError: err
			})
		);
});

router.route('/login').post((req, res) => {
	console.log('Users | Login Request from a user');
	const credential = req.body.email;
	const password = req.body.password;
	console.log('Username : ' + credential);
	console.log('Password : ********');

	var error = signUpValidations.validateEmail(credential);
	if (error != '') {
		error = signUpValidations.validateUserName(credential);
		if (error != '') {
			res.status(400).json({
				status: failure,
				message: 'Bad Request'
			});
		} else {
			console.log('looking up...... username : ' + credential);
			User.find({ userName: credential })
				.then((user) => {
					console.log('Found user with credentials : ' + credential);
					loginUser(user, password, req, res);
				})
				.catch((err) =>
					res.status(500).json({
						status: failure,
						message: 'Error while fetching userName !',
						internalError: err
					})
				);
		}
	} else {
		console.log('looking up...... email : ' + credential);
		User.find({ email: credential })
			.then((user) => {
				console.log('Found user with Email : ' + credential);
				loginUser(user, password, req, res);
			})
			.catch((err) =>
				res.status(500).json({
					status: failure,
					message: 'Error while fetching Email !',
					internalError: err
				})
			);
	}
});

router.route('/register').post((req, res) => {
	if (res.locals.user != null) {
		res.status(409).json({
			status: failure,
			error: 'Please logout before signup'
		});
		return;
	}
	console.log('Signup | New Request recieved at ' + new Date());
	const firstName = req.body.firstname;
	const lastName = req.body.lastname;
	const email = req.body.email;
	const phoneNumber = req.body.phonenumber;
	const userName = req.body.username;
	const password = req.body.password;

	let errors = [];
	errors.push(signUpValidations.validateName(firstName));
	errors.push(signUpValidations.validateName(lastName));
	errors.push(signUpValidations.validateEmail(email));
	errors.push(signUpValidations.validatePhoneNumber(phoneNumber));
	errors.push(signUpValidations.validateUserName(userName));
	errors.push(signUpValidations.validatePassword(password));
	errors = errors.filter((error) => error.length > 1);
	if (errors.length > 0) {
		console.log('Signup | Error Occured : ' + errors.toString);
		res.status(400).json({
			status: failure,
			message: errors
		});
		return;
	}

	const OTPs = { emailOTP: signUpValidations.generateNumericOTP(6), phoneOTP: '1234' };

	const newUser = new User({
		firstName: firstName,
		lastName: lastName,
		email: email,
		phoneNumber: phoneNumber,
		userName: userName,
		OTPs: OTPs
	});
	newUser.password = newUser.generateHash(password);
	newUser
		.save()
		.then((user) => {
			console.log('Signup | Success | New User Signup : ' + user.username + ' OTP : ' + user.OTPs.emailOTP);
			mailUtil.sendSignUpMail(user);
			return res.status(202).json({
				status: success,
				message: 'Signup is successfull. Thanks for Registering with us.'
			});
		})
		.catch((err) => {
			console.log('Signup | Failed | Error Occured : ' + err);
			return res.status(400).json({
				status: failure,
				message: 'Error while saving User !',
				internalError: err
			});
		});
});

module.exports = router;
