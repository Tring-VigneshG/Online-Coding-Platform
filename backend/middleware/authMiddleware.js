import jwt from "jsonwebtoken";
import { JWT_SECRET_KEY } from "../utils/auth.js";
import { query } from "../db/db.js";
const authMiddleware = async (token) => {
    if (!token) {
        throw Error("Token not found.Please provide token");
    }
    try {
        token = token.replace("Bearer ", "");
        const decodedToken = jwt.verify(token, JWT_SECRET_KEY);
        
        const { rows } = await query("SELECT id, name, email FROM users WHERE id = $1", [decodedToken.userId]);
        if (rows.length === 0) {
            throw new Error("User not found. Account might be deleted.");
        }

        return decodedToken;
    }
    catch (error) {
        throw Error("Token is invalid");
    }
};
export { authMiddleware };