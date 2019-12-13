const router = require("express").Router();
let Orders = require("../models/order.model");
const userSessionUtil = require("../validations/userSessionUtil");

const success = "success";
const failure = "failure";

// User
router.route("/:oid").get((req, res) => {
  userSessionUtil.allowIfLoggedIn(req, res);
  Product.find({ _id: req.params.oid })
    .then(order => res.status(200).json(order))
    .catch(err => res.status(500).json(`Error: ${err}`));
});

router.route("/new").post((req, res) => {
  userSessionUtil.allowIfLoggedIn(req, res);
  var productId = req.body.product_id;
  var user = res.locals.user;
  let {
    _id,
    email,
    isVerifiedEmail,
    isVerifiedPhone,
    isEligibleForOrder
  } = user;
  console.log(
    "Order Request by : " +
      email +
      " | Product Id : " +
      productId +
      " \n --- \n Profile Details : \nEmail Verified : " +
      isVerifiedEmail +
      " \nPhone Number Verified: " +
      isVerifiedPhone +
      " \nOrder Eligible: " +
      isEligibleForOrder +
      "\n---"
  );
  // Check whether the User is eligible for booking

  // Check whether product is available at the location

  // Check whether the product is already booked for the dates

  //Lets book the Product
});

//Admin
router.route("/all").get((req, res) => {
  userSessionUtil.allowIfAdmin(req, res);
  Product.find()
    .then(orders => res.status(200).json(orders))
    .catch(err => res.status(500).json(`Error: ${err}`));
});

module.exports = router;
