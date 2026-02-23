import { Router } from 'express';
import * as authController from './auth.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import {
  authRateLimit,
  requestLimit,
} from '../../middlewares/request-limit.js';
import { upload, handleUploadError } from '../../helpers/file-upload.js';
import {
  validateRegister,
  validateLogin,
  validateVerifyEmail,
  validateResendVerification,
  validateForgotPassword,
  validateResetPassword,
  handleValidationErrors,
} from '../../middlewares/validation.js';
import { body } from 'express-validator';

const router = Router();

// ─── Validaciones para actualizar perfil ──────────────────────────────────────
const validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('El nombre no puede estar vacío')
    .isLength({ max: 25 }).withMessage('El nombre no puede tener más de 25 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El nombre solo puede contener letras y espacios'),

  body('surname')
    .optional()
    .trim()
    .notEmpty().withMessage('El apellido no puede estar vacío')
    .isLength({ max: 25 }).withMessage('El apellido no puede tener más de 25 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El apellido solo puede contener letras y espacios'),

  body('username')
    .optional()
    .trim()
    .notEmpty().withMessage('El nombre de usuario no puede estar vacío')
    .isLength({ max: 50 }).withMessage('El nombre de usuario no puede tener más de 50 caracteres'),

  body('phone')
    .optional()
    .matches(/^\d{8}$/).withMessage('El teléfono debe tener exactamente 8 dígitos'),

  handleValidationErrors,
];

// ─── Validaciones para cambiar contraseña ────────────────────────────────────
const validateChangePassword = [
  body('currentPassword')
    .notEmpty().withMessage('La contraseña actual es obligatoria'),

  body('newPassword')
    .notEmpty().withMessage('La nueva contraseña es obligatoria')
    .isLength({ min: 8, max: 255 }).withMessage('La nueva contraseña debe tener entre 8 y 255 caracteres'),

  body('confirmPassword')
    .notEmpty().withMessage('La confirmación de contraseña es obligatoria'),

  handleValidationErrors,
];

// ─── AUTH ROUTES ──────────────────────────────────────────────────────────────

router.post(
  '/register',
  authRateLimit,
  upload.single('profilePicture'),
  handleUploadError,
  validateRegister,
  authController.register
);

router.post('/login', authRateLimit, validateLogin, authController.login);

router.post(
  '/verify-email',
  requestLimit,
  validateVerifyEmail,
  authController.verifyEmail
);

router.post(
  '/resend-verification',
  authRateLimit,
  validateResendVerification,
  authController.resendVerification
);

router.post(
  '/forgot-password',
  authRateLimit,
  validateForgotPassword,
  authController.forgotPassword
);

router.post(
  '/reset-password',
  authRateLimit,
  validateResetPassword,
  authController.resetPassword
);

// ─── PROFILE ROUTES ───────────────────────────────────────────────────────────

// GET /api/v1/auth/profile — Ver mi perfil
router.get('/profile', validateJWT, authController.getProfile);

// POST /api/v1/auth/profile/by-id — Ver perfil por ID
router.post('/profile/by-id', requestLimit, authController.getProfileById);

// PUT /api/v1/auth/profile — Editar perfil (name, surname, username, phone, foto)
// IMPORTANTE: change-password debe ir ANTES de /profile para que no lo intercepte
router.put(
  '/profile/change-password',
  validateJWT,
  validateChangePassword,
  authController.changePassword
);

// PUT /api/v1/auth/profile — Editar datos + foto de perfil
router.put(
  '/profile',
  validateJWT,
  upload.single('profilePicture'),
  handleUploadError,
  validateUpdateProfile,
  authController.updateProfile
);

export default router;