const { verifyUser } = require('../utils/verifyToken');
const userRouter = require("express").Router();
const { createUser,findAll,findByID,deleteUser, updateUser} = require('../controllers/user');



userRouter.post('/user/create', createUser);
userRouter.get('/user/findall',verifyUser,findAll);
userRouter.get('/user/findById/:_id',verifyUser,findByID);
userRouter.delete('/user/delete/:_id',verifyUser,deleteUser)
userRouter.put('/user/update/:_id',verifyUser,updateUser)

module.exports = userRouter;