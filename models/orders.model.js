const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const OrdersSchema = new Schema(
  {
    productId: {
      type: String,
      required: true,
      unique: false,
      trim: true
    },
    userId: {
      type: String,
      required: true,
      unique: false,
      trim: true
    },
    cityOfBooking: {
      type: String,
      required: true,
      unique: false,
      trim: true
    },
    pickupDate: {
      type: Date,
      required: true
    },
    dropOffDate: {
      type: Date,
      required: true
    },
    addressDeliver: {
      type: String,
      required: true,
      unique: false,
      trim: true
    },
    billingAddress: {
      type: String,
      required: true,
      unique: false,
      trim: true
    },
    totalPrice: {
      type: String,
      required: true,
      unique: false,
      trim: true
    },
    billingPrice: {
      type: String,
      required: true,
      unique: false,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Orders", OrdersSchema);
