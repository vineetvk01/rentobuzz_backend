function validateName(value) {
	if (value.length < 4) {
		return 'Invalid, Minimum length is 4';
	}
	return '';
}

function validateEmail(value) {
	if (value == undefined) {
		return 'Empty username';
	}
	if (value.includes('@')) {
		_email = value.split('@');
		let domainName = _email[1];
		if (!domainName.includes('.')) {
			return 'Invalid Email ! Please check domain name';
		}
	}
	if (value.length < 5 || !value.includes('@')) {
		return 'Invalid Email, Please check the value';
	}
	return '';
}

function validatePhoneNumber(value) {
	var phoneno = /^\d{10}$/;
	if (!value.match(phoneno)) {
		return 'Invalid Phone number';
	}
	return '';
}

function validateUserName(value) {
	if (value.length < 5 || value.length > 12) {
		return 'Invalid Username! Please check the length';
	}
	if (value.toLowerCase() != value) {
		return 'Please use lowercase for username';
	}
	return '';
}

function validatePassword(value) {
	var passw = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
	if (!value.match(passw)) {
		return 'Invalid Password! 6 to 20 characters which contain at least one numeric digit, one uppercase and one lowercase letter';
	}
	return '';
}

module.exports = { validateName, validateEmail, validatePhoneNumber, validateUserName, validatePassword };
