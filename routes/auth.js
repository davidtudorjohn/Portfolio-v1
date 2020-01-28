const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Models/User.js");
const { registerValidation, loginValidation } = require("../validation");

router.post("/register", async (req, res) => {
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  console.log(error);

  const emailExists = await User.findOne({ email: req.body.email });
  if (emailExists) return res.status(400).send("Email already exists.");

  console.log(emailExists);

  const salt = await bcrypt.genSalt(10);
  const hashedPass = await bcrypt.hash(req.body.password, salt);
  console.log(hashedPass);

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPass
  });
  console.log(user);

  try {
    const savedUser = await user.save();
    console.log(`User saved: ${savedUser}`);
    res.send({ _id: user._id });
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

router.post("/login", async (req, res) => {
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Email doesn't exist.");

  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) return res.status(400).send("Invalid password");

  console.log("Logged in");

  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
  console.log(token);
  res.header("auth-token", token).send(token);

  // res.send("Logged in!");
});
module.exports = router;
