// This middleware function is used to authenticate the user by verifying the JWT (JavaScript Web Token: holds users authentication and authorizations ) token sent in the request headers.
// If the token is valid, it will attach the user object to the request and call the next middleware function.
// If the token is invalid or missing, it will return a 401 status code with an error message.
const supabase = require("../database/supabase");

const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        message: "Invalid or expired authentication token",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Authentication error:", error);

    return res.status(500).json({
      message: "Authentication server error",
    });
  }
};

module.exports = authenticateUser;