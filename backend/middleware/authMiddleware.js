import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret");
        req.user = decoded.id;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};

export default authMiddleware;