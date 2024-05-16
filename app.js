// app.js

const express = require("express");
const multer = require("multer");
const {
  generateValidationMiddleware,
} = require("./middleware/validationMiddleware");

const app = express();
app.use(express.json());

// Multer configuration for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Example route with form data handling and validation middleware
app.post(
  "/register",
  upload.single("file"),
  generateValidationMiddleware([
    "username",
    "email",
    "password",
    "dob",
    "file",
  ]),
  (req, res) => {
    // Access form fields and uploaded file from req.body and req.file respectively
    const { username, email, password, dob, fileType } = req.body;
    const file = req.file;
    console.log(file);

    // Process registration logic
    // You can access the uploaded file using req.file
    res.status(200).json({
      success: true,
      data: {
        /* Response data */
      },
      message: "User registered successfully",
      errors: [],
    });
  }
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
