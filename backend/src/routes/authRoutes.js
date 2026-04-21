const express = require('express');
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');
const { protect, adminOnly } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many auth requests, please try again later'
});

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User management and login
 */

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *     responses:
 *       201:
 *         description: Successfully created user
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists
 */
router.post('/register', authLimiter, [
  check('name', 'Name must be between 2 and 50 characters').isLength({ min: 2, max: 50 }),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Please enter a password with 6 or more characters and at least one digit')
    .isLength({ min: 6 })
    .matches(/\d/)
], validate, authController.register);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean' }
 *                 data:
 *                   type: object
 *                   properties:
 *                     token: { type: 'string' }
 *                     user: { $ref: '#/components/schemas/User' }
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', authLimiter, [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists().notEmpty()
], validate, authController.login);

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get current user
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Current user information
 *       401:
 *         description: Not authorized
 */
router.get('/me', protect, authController.getMe);

/**
 * @swagger
 * /api/v1/auth/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not admin
 */
router.get('/users', protect, adminOnly, authController.getAllUsers);

module.exports = router;
