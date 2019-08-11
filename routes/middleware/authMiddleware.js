const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function(req, res, next) {
  // get Token from header

  // x-auth-token Key to Token
  const token = req.header("x-auth-token");

  // Check if Not Token
  if (!token)
    return res.status(401).json({
      msg: "No Token. Authorization Denied!"
    });

  try {
    // Decoding Token to Get it verify
    const decoded = jwt.verify(token, config.get("jwtSecret"));

    req.user = decoded.user;
    next();
  } catch (error) {
    res.status(401).json({
      msg: "Token is not Valid"
    });
  }
};
