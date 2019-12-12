const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const userSessionUtil = require("./validations/userSessionUtil");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";
const uri = process.env.ATLAS_URI;
const auth_preToken = process.env.PRE_TOKEN || "basic";

//const SESS_LIFETIME = process.env.SESS_LIFETIME || 2*60*60*1000
//const SESS_NAME = process.env.SESS_NAME || 'sid'
//const SESS_SECRET = process.env.SESS_NAME || 'iamsessionsecret'

const IN_PROD = NODE_ENV === "production";

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
  })
  .catch(error => {
    console.log(`Unable to connect ${error}`);
  });
const connection = mongoose.connection;
connection.once("open", () => {
  console.log("Connected !");
});

app.use(cors());
app.use(cookieParser());
app.use(express.json());

app.use((req, res, next) => {
  const { ticket } = req.cookies;
  const { authorization } = req.headers;
  if (authorization) {
    const session_token = authorization.split(" ");
    if (session_token[0] == auth_preToken) {
      userSessionUtil.fetchUserFromSessionToken(
        session_token[1],
        req,
        res,
        next
      );
    }
  } else if (ticket) {
    userSessionUtil.fetchUserFromSessionToken(ticket, req, res, next);
  } else {
    next();
  }
});

const usersRouter = require("./routes/users");
const productRouter = require("./routes/products");

const api_v1 = "/api/v1";
app.use(api_v1 + "/users", usersRouter);
app.use(api_v1 + "/products", productRouter);

app.use((req, res, next) => {
  res.status(404).json({
    status: "Not Found",
    message: "This URI is not configured"
  });
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
