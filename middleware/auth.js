const jwt = require("jsonwebtoken");
const Dev = require("../models/Dev");

module.exports = {
  ensureAuth: async (req, res, next) => {
    let token;
    // check if token is in the http headers and it starts with bearer
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      try {
        // get the token from the bearer header
        token = req.headers.authorization.split(" ")[1];

        //verify the token
        const decodeToken = jwt.verify(token, process.env.TOKEN);

        // assign it to a user
        req.dev = await Dev.findById(decodeToken.id).select("-password");
        next();
      } catch (error) {
        console.log(error);
        res.status(401).json({ message: "not authourised" });
      }
    } else {
      res
        .status(401)
        .json({ message: " not authorized to view this resource please login" });
    }
  },
};
