// middleware/validationMiddleware.js

const { body, validationResult } = require("express-validator");
const { v4: uuidv4 } = require("uuid");

const allowedFileTypes = ["png", "jpg", "jpeg", "pdf"]; // Allowed file extensions
// Configuration object for validation rules
const validationConfig = {
  username: [
    body("username").notEmpty().withMessage("Username is required"),
    body("username")
      .isLength({ min: 5 })
      .withMessage("Username must be at least 5 characters long"),
  ],
  email: [
    body("email").notEmpty().withMessage("Email is required"),
    body("email").isEmail().withMessage("Invalid email address"),
  ],
  password: [
    body("password").notEmpty().withMessage("Password is required"),
    body("password")
      .matches(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      .withMessage(
        "Password must contain at least one letter, one number, and one special character"
      ),
  ],
  dob: [
    body("dob").notEmpty().withMessage("Date of Birth is required"),
    body("dob").isDate().withMessage("Invalid Date of Birth format"),
    body("dob").custom((value) => {
      const today = new Date();
      const birthDate = new Date(value);
      const age = today.getFullYear() - birthDate.getFullYear();
      const month = today.getMonth() - birthDate.getMonth();

      if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age < 18) {
        throw new Error("Must be at least 18 years old");
      }

      return true;
    }),
  ],
  role: [
    body("role").notEmpty().withMessage("Role is required"),
    body("role").isIn(["admin", "user"]).withMessage("Invalid role"),
  ],
  file: [
    body("file").custom((value, { req }) => {
      if (!req.file) {
        throw new Error("File is required");
      }

      const fileExtension = req.file.originalname
        .split(".")
        .pop()
        .toLowerCase(); // Extract file extension
      if (!allowedFileTypes.includes(fileExtension)) {
        throw new Error("Invalid file type");
      }

      return true;
    }),
  ],
  fileSize: [
    body("fileSize").notEmpty().withMessage("File size is required"),
    body("fileSize").isNumeric().withMessage("File size must be a number"),
    body("fileSize").custom((value) => {
      const maxSize = 10; // Maximum file size in MB
      if (value > maxSize) {
        throw new Error(`File size should be less than ${maxSize} MB`);
      }
      return true;
    }),
  ],
};

// Function to generate validation middleware dynamically
function generateValidationMiddleware(fields) {
  return (req, res, next) => {
    const validations = fields.map((field) => validationConfig[field]).flat();
    Promise.all(validations.map((validation) => validation.run(req))).then(
      () => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        next();
      }
    );
  };
}

module.exports = { generateValidationMiddleware };
