const model = require('../models/user')
const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const formidable = require('formidable');
const path = require('path');
const fs = require('fs');
const { config } = require('dotenv')
config()


exports.createUser = async (req, res) => {
  // formidable form instance

  const form = new formidable.IncomingForm();
  try {
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });
  

    const firstName = fields.firstName?.[0] || fields.firstName;
    const lastName = fields.lastName?.[0] || fields.lastName;
    const email = fields.email?.[0] || fields.email;
    const role = fields.role?.[0] || fields.role;
    const password = fields.password?.[0] || fields.password;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !role || !password) {
      return res.status(400).json({
        status: false,
        message: 'Fill out all required fields',
        data: null,
      });
    }

    // Check if user email exists
    const checkEmail = await model.findOne({ email: email });
    if (checkEmail) {
      return res.status(409).json({
        status: false,
        message: 'A user exists with this email',
        user: null,
      });
    }

    // Handle file upload
    let fileURL = null;
  
    if (files.files) {
      const file = files.file[0]; // Access file array
     
      const timestamp = Date.now();
      const randString = Math.floor(100000 + Math.random() * 900000);
      const newFilename = `${timestamp}${randString}${file.originalFilename}`;
      const uploadDir = path.resolve(__dirname, '../public/uploads');
      const newPath = path.join(uploadDir, newFilename);

      // upload directory 
      await fs.promises.mkdir(uploadDir, { recursive: true });
     
      await fs.promises.copyFile(file.filepath, newPath);
      await fs.promises.unlink(file.filepath);

      fileURL = `${newFilename}`; // static file serving url
    }

    // Hash password
    const hashedPassword = await bcrypt.hashSync(password, 10);

    // Save user
    const user = await new model({
      firstName,
      lastName,
      email: email,
      role,
      picURL: fileURL,
      password: hashedPassword,
    }).save();

    // Generate JWT
    const token = jwt.sign(
      { email: user.email, id: user._id },
      process.env.SECRET_KEY || 'fallback-secret',
      { expiresIn: '1h' }
    );

    return res.status(200).json({
      status: true,
      user,
      token,
      message: 'Registration Successful',
    });
  } catch (err) {
    console.error('Error creating user:', err);
    return res.status(500).json({
      status: false,
      message: `Error saving user: ${err.message}`,
      user: null,
    });
  }
};

exports.findAll = async (req, res) => {
  try {
    const users = await model.find({ status: 'Active' });
    console.log("999",users)
    return res.status(200).json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    return res.status(500).json({
      message: 'Error fetching users',
      error: err.message,
    });
  }
};

exports.findByID = async (req, res) => {
  try {
    const { _id } = req.params;
    const user = await model.findOne({ _id, status: 'Active' });
    if (!user) {
      return res.status(404).json({
        message: 'No active user found with this ID',
      });
    }
    return res.status(200).json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    return res.status(500).json({
      message: 'Error fetching user',
      error: err.message,
    });
  }
};

exports.deleteUser = async (req, res) => {

  const { _id } = req.params;
  const status = 'Deactivated'
  const data = await model.findOne({ _id: _id })
  if (!data) {
    return res.status(400).send({
      message: `No record found`,
    })
  }

  else {
    try {

      const saveDelete = new model({
        _id: _id,
        status: status,

      });
      let save = await model.updateOne({ _id: _id }, saveDelete)

      if (save) {
        return res.status(200).send({
          status: true,
          user: save,
          message: 'Deleted Successfully',
        })


      }
    } catch (err) {
      console.log(err)
      res.status(500).json({
        status: false,
        message: `Error deleting data ${err}`,
        user: null,
      })
    }
  }
  
};

exports.updateUser = async (req, res) => {
  try {
    const { _id, firstName, lastName, email, role } = req.body;

    if (!_id || !firstName || !lastName || !email || !role) {
      return res.status(400).json({
        status: false,
        message: 'All fields are required',
        data: null,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({
        status: false,
        message: 'Invalid user ID',
      });
    }

    // Check if email is already used by another user
    const existingUser = await model.findOne({
      email: email, //.toLowerCase(),
      _id: { $ne: _id },
    });
    if (existingUser) {
      return res.status(409).json({
        status: false,
        message: 'Email is already in use by another user',
        data: null,
      });
    }

    const result = await model.updateOne(
      { _id, status: 'Active' },
      { firstName, lastName, email: email, role }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({
        status: false,
        message: 'No active user found or no changes made',
        data: null,
      });
    }

    return res.status(200).json({
      status: true,
      message: 'User updated successfully',
    });
  } catch (err) {
    console.error('Error updating user:', err);
    return res.status(500).json({
      status: false,
      message: `Error updating user: ${err.message}`,
      data: null,
    });
  }
};