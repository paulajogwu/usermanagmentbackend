const model = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {config} = require('dotenv')
config();


exports.login = async (req, res) => {
  let email = req.body.email.toLowerCase();
  let password = req.body.password;
  // find user
  console.log("good *************", req.body)
  if (
    email == null ||
    email == '' ||
    password == null ||
    password == ''
  ) {
    return  res.status(500).json({
      status: false,
      message: 'Fill out all required fields',
      data: null,
    })
  } else {//emailmodel
  

    const check_email = await model.findOne({ email: email })
      .then((user) => user)
      .catch(() => null)

    if (check_email) {


      model.findOne({ email: email })
        .then(async (user) => {
          
          let hash = user.password;
          let userStatus = user.status;

          if (!bcrypt.compareSync(password, hash)) {
            return res.send({
              status: false,
              message: 'Password Incorrect',
              data: null,
            })

          } else if (userStatus == "Deactivated") {
            return   res.send({
                status: false,
                message: 'Please Verify Your Account',
                data: null,
              })
          }

          else {
            //if Passwords match
            const token = jwt.sign({ emails: user.email, id: user._id }, `${process.env.SECRET_KEY}`, { expiresIn: '3h' })

            const id = user._id
            model.findOne({ _id: id })
              .then((userInfo) => {
                if (!userInfo) {
                 return  res.send({
                    status: false,
                    message: 'No record found',
                    data: null,
                  })
                } else {
                  return res.send({
                    status: true,
                    user: userInfo,
                    token: token,
                    message: 'Login Successful',
                  })
                }
              })
          }
        }
        )

    } else {

      res.send({
        status: false,
        message: 'Email does not exist',
        data: null,
      })

    }
  }
}