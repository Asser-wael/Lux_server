import jwt from "jsonwebtoken";


const generateRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_REFRESH, { expiresIn: "7d" });
};

export default generateRefreshToken;