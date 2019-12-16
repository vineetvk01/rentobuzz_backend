const nodemailer = require('nodemailer');

async function sendMailNow(mailObject) {
	const NODE_ENV = process.env.NODE_ENV || 'development';
	const MAIL_TEST = process.env.MAIL_TEST || false;
	if (NODE_ENV === 'production' || MAIL_TEST == true) {
		// create reusable transporter object using the default SMTP transport
		let transporter = nodemailer.createTransport({
			host: 'smtp.gmail.com',
			port: 587,
			secure: false, // true for 465, false for other ports
			auth: {
				user: process.env.SENDER_EMAIL, // generated ethereal user
				pass: process.env.SENDER_PASSWORD // generated ethereal password
			},
			tls: {
				rejectUnauthorized: false
			}
		});

		let mailObjectConstruct = {
			from: '"RentoBuzz" <' + process.env.SENDER_EMAIL + '>',
			to: mailObject.to, // list of receivers
			subject: mailObject.subject, // Subject line
			text: mailObject.text, // plain text body
			html: mailObject.html // html body
		};
		// send mail with defined transport object
		let info = await transporter.sendMail(mailObjectConstruct);

		console.log('Message sent: %s', info.messageId);
		// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

		// Preview only available when sending through an Ethereal account
		console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
		// Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
	}
}

function sendSignUpMail(user) {
	const signUpMailObj = {
		to: user.email,
		subject: 'Glad to have you! Please confirm your email...',
		text: 'Hey! Your OTP is : ' + user.OTPs.emailOTP,
		html:
			'<h4>Hey ' +
			user.firstName +
			' ' +
			user.lastName +
			' ,</h4><p> Welcome to Rentobuzz.. Please verify your email now.. OTP : ' +
			user.OTPs.emailOTP +
			' or <a href="">click here</a></p>'
	};
	sendMailNow(signUpMailObj);
}
module.exports = { sendMailNow, sendSignUpMail };
