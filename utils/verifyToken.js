const jwt = require("jsonwebtoken");
require('dotenv').config();

exports.verifyUser = async (req, res, next) => {
    // const token = `${req.headers['x-access-token']}`
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    console.log("-----------------", token)
    if (!token) {
        return res.status(404).json({
            status: false,
            message: 'Token does not exist',
        })
    } else {
        jwt.verify(token, `${process.env.SECRET_KEY}`, (err) => {
            if (err) {
                return res.status(403).json({
                    status: false,
                    message: 'authentication error, Please try again',
                })
            } else {
                
        next();
            }
        })
    }
}