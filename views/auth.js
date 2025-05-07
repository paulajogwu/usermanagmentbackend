const authRouter = require("express").Router();
const { login} = require('../controllers/auth');



authRouter.post('/user/login', login);
module.exports = authRouter;