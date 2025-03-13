import bcrypt from "bcryptjs";
import  jwt from "jsonwebtoken";
const JWT_SECRET_KEY = "vignesh"
const hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
};
const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};
const generateToken = (userId) => {
    return jwt.sign({ userId }, JWT_SECRET_KEY, { expiresIn: "1d" });
};

export{hashPassword,comparePassword,generateToken,JWT_SECRET_KEY};
