const router = require("express").Router();
let Product = require("../models/products.model");
const userSessionUtil = require("../validations/userSessionUtil");

const success = "success";
const failure = "failure";

// Guest
router.route("/:pid").get((req, res) => {
  Product.find({ _id: req.params.pid })
    .then(product => res.status(200).json(product))
    .catch(err => res.status(500).json(`Error: ${err}`));
});

router.route("/search/:query").get((req, res) => {
  var search_query = req.params.query;
  if (search_query.length < 1) {
    res.status(500).json(`Error: Not a valid search`);
  }
  Product.find({
    productName: { $regex: ".*" + search_query + ".*", $options: "i" }
  })
    .then(product => res.status(200).json(product))
    .catch(err => res.status(500).json(`Error: ${err}`));
});

// Only For Admin

router.route("/").get((req, res) => {
  userSessionUtil.allowIfAdmin(req, res);
  Product.find()
    .then(product => res.json(product))
    .catch(err => res.status(500).json(`Error: ${err}`));
});

router.route("/:pid").put((req, res) => {
  userSessionUtil.allowIfAdmin(req, res);
  const updateProduct = {
    productName: req.body.product_name,
    description: req.body.description,
    title: req.body.title,
    availableInCity: req.body.available_in_city,
    pricePerDay: req.body.price_per_day,
    lowestPrice: req.body.lowest_price,
    category: req.body.category
  };

  Product.findByIdAndUpdate(req.params.pid, updateProduct, { upsert: false })
    .then(product =>
      res.status(202).json({
        status: success,
        message: "id: " + product._id
      })
    )
    .catch(err => res.status(500).json(`Error: ${err}`));
});

router.route("/").post((req, res) => {
  userSessionUtil.allowIfAdmin(req, res);

  const newProduct = new Product({
    productName: req.body.product_name,
    description: req.body.description,
    title: req.body.title,
    availableInCity: req.body.available_in_city,
    pricePerDay: req.body.price_per_day,
    lowestPrice: req.body.lowest_price,
    category: req.body.category
  });

  newProduct
    .save()
    .then(product =>
      res.status(202).json({
        status: success,
        message: "id: " + product._id
      })
    )
    .catch(err =>
      res.status(500).json({
        status: failure,
        message: "Internal Server Error",
        internalError: err
      })
    );
});

module.exports = router;
