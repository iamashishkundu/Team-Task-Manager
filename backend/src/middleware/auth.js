const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const bearerToken = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;
  const token = req.cookies.token || bearerToken;

  if (!token) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
}

module.exports = auth;
