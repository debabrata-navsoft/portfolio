import jwt from "jsonwebtoken";
import Admin from "../models/admin.model.js";

const protectAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Admin.findById(decoded.id).select("-password");

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Admin not found",
      });
    }

    req.admin = admin;

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

/**
 * Soft version of protectAdmin for public routes: resolves to the admin when the request
 * carries a valid token, otherwise null — it never rejects the request.
 */
export const adminFromRequest = (req) => {
  const authHeader = req.headers.authorization;

  return authHeader?.startsWith("Bearer ") ? adminFromToken(authHeader.split(" ")[1]) : null;
};

/** Same check for a bare token — the socket `admin:join` handshake uses it. */
export const adminFromToken = async (token) => {
  if (typeof token !== "string" || !token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return await Admin.findById(decoded.id).select("_id name");
  } catch {
    return null;
  }
};

export default protectAdmin;
