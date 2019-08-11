const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const {check, validationResult} = require("express-validator");

const User = require("../../model/User");

// POST api/users/register
// Register User Router
// Public
router.post(
  "/register",
  [
    check("name", "Please Enter Name")
      .not()
      .isEmpty(),
    check("email", "Please Enter Valid Email").isEmail(),
    check(
      "password",
      "Please Enter Password with 6 or more Characters"
    ).isLength({min: 6}),
    check("userName", "Please Enter User Name")
      .not()
      .isEmpty()
  ],
  async (req, res) => {
    // Check for Validation
    const errors = validationResult(req);
    // If Errors Send
    if (!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array()});
    }

    const {name, email, password, userName} = req.body;

    try {
      // See If User Exist
      let user = await User.findOne({email});

      if (user) {
        return res.status(400).json({errors: [{msg: "User Already exists"}]});
      }

      user = await User.findOne({userName});
      if (user) {
        return res.status(400).json({errors: [{msg: "User Name is Taken"}]});
      }

      user = new User({
        name,
        email,
        password,
        userName
      });

      // Encrypt Password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        {expiresIn: 360000},
        (error, token) => {
          if (error) throw error;

          // Return jsonwebtoken
          res.json({msg: "User Registered Successfully!"});
        }
      );
    } catch (error) {
      console.log(error);
      res.status(500).send("Something Went Wrong. Please Try Again");
    }
  }
);

module.exports = router;
