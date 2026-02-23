import {
  registerUserHelper,
  loginUserHelper,
  verifyEmailHelper,
  resendVerificationEmailHelper,
  forgotPasswordHelper,
  resetPasswordHelper,
} from '../../helpers/auth-operations.js';
import { getUserProfileHelper } from '../../helpers/profile-operations.js';
import { asyncHandler } from '../../middlewares/server-genericError-handler.js';
import { User, UserProfile } from '../users/user.model.js';
import { findUserById } from '../../helpers/user-db.js';
import { uploadImage, deleteImage } from '../../helpers/cloudinary-service.js';
import { hashPassword, verifyPassword } from '../../utils/password-utils.js';
import { config } from '../../configs/config.js';
import crypto from 'crypto';
import path from 'path';

// ─── REGISTER ─────────────────────────────────────────────────────────────────
export const register = asyncHandler(async (req, res) => {
  try {
    const userData = {
      ...req.body,
      profilePicture: req.file ? req.file.path : null,
    };

    const result = await registerUserHelper(userData);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error in register controller:', error);

    let statusCode = 400;
    if (
      error.message.includes('ya está registrado') ||
      error.message.includes('ya está en uso') ||
      error.message.includes('Ya existe un usuario')
    ) {
      statusCode = 409;
    }

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error en el registro',
      error: error.message,
    });
  }
});

// ─── LOGIN ────────────────────────────────────────────────────────────────────
export const login = asyncHandler(async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;
    const result = await loginUserHelper(emailOrUsername, password);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in login controller:', error);

    let statusCode = 401;
    if (
      error.message.includes('bloqueada') ||
      error.message.includes('desactivada')
    ) {
      statusCode = 423;
    }

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error en el login',
      error: error.message,
    });
  }
});

// ─── VERIFY EMAIL ─────────────────────────────────────────────────────────────
export const verifyEmail = asyncHandler(async (req, res) => {
  try {
    const { token } = req.body;
    const result = await verifyEmailHelper(token);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in verifyEmail controller:', error);

    let statusCode = 400;
    if (error.message.includes('no encontrado')) {
      statusCode = 404;
    } else if (
      error.message.includes('inválido') ||
      error.message.includes('expirado')
    ) {
      statusCode = 401;
    }

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error en la verificación',
      error: error.message,
    });
  }
});

// ─── RESEND VERIFICATION ──────────────────────────────────────────────────────
export const resendVerification = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;
    const result = await resendVerificationEmailHelper(email);

    if (!result.success) {
      if (result.message.includes('no encontrado')) return res.status(404).json(result);
      if (result.message.includes('ya ha sido verificado')) return res.status(400).json(result);
      return res.status(503).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in resendVerification controller:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
});

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────
export const forgotPassword = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;
    const result = await forgotPasswordHelper(email);

    if (!result.success && result.data?.initiated === false) {
      return res.status(503).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in forgotPassword controller:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
});

// ─── RESET PASSWORD ───────────────────────────────────────────────────────────
export const resetPassword = asyncHandler(async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const result = await resetPasswordHelper(token, newPassword);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in resetPassword controller:', error);

    let statusCode = 400;
    if (error.message.includes('no encontrado')) {
      statusCode = 404;
    } else if (
      error.message.includes('inválido') ||
      error.message.includes('expirado')
    ) {
      statusCode = 401;
    }

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error al resetear contraseña',
      error: error.message,
    });
  }
});

// ─── GET PROFILE ──────────────────────────────────────────────────────────────
export const getProfile = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const user = await getUserProfileHelper(userId);

  return res.status(200).json({
    success: true,
    message: 'Perfil obtenido exitosamente',
    data: user,
  });
});

// ─── GET PROFILE BY ID ────────────────────────────────────────────────────────
export const getProfileById = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'El userId es requerido',
    });
  }

  const user = await getUserProfileHelper(userId);

  return res.status(200).json({
    success: true,
    message: 'Perfil obtenido exitosamente',
    data: user,
  });
});

// ─── UPDATE PROFILE ───────────────────────────────────────────────────────────
// PUT /api/v1/auth/profile
// Edita: name, surname, username, phone y foto de perfil (sube a Cloudinary)
export const updateProfile = asyncHandler(async (req, res) => {
  try {
    const userId = req.userId;
    const { name, surname, username, phone } = req.body;

    // Buscar usuario
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // Si viene nuevo username, verificar que no esté en uso por otro usuario
    if (username && username !== user.Username) {
      const existingUser = await User.findOne({ where: { Username: username } });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'El nombre de usuario ya está en uso por otra cuenta',
        });
      }
    }

    // Actualizar campos del usuario
    await user.update({
      ...(name && { Name: name }),
      ...(surname && { Surname: surname }),
      ...(username && { Username: username }),
    });

    // Actualizar teléfono en UserProfile si viene
    if (phone) {
      const userProfile = await UserProfile.findOne({ where: { UserId: userId } });
      if (userProfile) {
        await userProfile.update({ Phone: phone });
      }
    }

    // Si viene imagen nueva, subirla a Cloudinary igual que en registerUserHelper
    if (req.file) {
      try {
        // Normalizar ruta igual que en auth-operations.js
        let normalizedPath = req.file.path.replace(/\\/g, '/');
        if (!path.isAbsolute(normalizedPath)) {
          normalizedPath = path.resolve(normalizedPath).replace(/\\/g, '/');
        }

        // Generar nombre único para Cloudinary
        const ext = path.extname(req.file.originalname);
        const randomHex = crypto.randomBytes(6).toString('hex');
        const cloudinaryFileName = `profile-${randomHex}${ext}`;

        // Subir a Cloudinary — retorna la secure_url completa
        const newProfilePictureUrl = await uploadImage(normalizedPath, cloudinaryFileName);

        // Actualizar foto en UserProfile
        const userProfile = await UserProfile.findOne({ where: { UserId: userId } });
        if (userProfile) {
          // Eliminar imagen anterior de Cloudinary si no es el avatar por defecto
          const oldPicture = userProfile.ProfilePicture;
          if (oldPicture && oldPicture.includes('cloudinary.com')) {
            await deleteImage(oldPicture);
          }
          await userProfile.update({ ProfilePicture: newProfilePictureUrl });
        }
      } catch (uploadError) {
        console.error('Error uploading profile picture:', uploadError.message);
        // No fallar todo el request si solo falla la imagen
        return res.status(500).json({
          success: false,
          message: 'Error al subir la imagen de perfil a Cloudinary',
          error: uploadError.message,
        });
      }
    }

    // Obtener perfil completo actualizado
    const updatedUser = await getUserProfileHelper(userId);

    return res.status(200).json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Error in updateProfile controller:', error);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: error.errors.map((e) => e.message),
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error al actualizar el perfil',
      error: error.message,
    });
  }
});

// ─── CHANGE PASSWORD ──────────────────────────────────────────────────────────
// PUT /api/v1/auth/profile/change-password
// Requiere la contraseña actual para poder cambiarla
export const changePassword = asyncHandler(async (req, res) => {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validar que la nueva contraseña y confirmación coincidan
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'La nueva contraseña y la confirmación no coinciden',
      });
    }

    // Validar que la nueva contraseña sea diferente a la anterior
    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: 'La nueva contraseña debe ser diferente a la contraseña actual',
      });
    }

    // Buscar usuario con contraseña
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // Verificar contraseña actual usando verifyPassword de password-utils
    const isValidPassword = await verifyPassword(user.Password, currentPassword);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'La contraseña actual es incorrecta',
      });
    }

    // Hashear la nueva contraseña usando hashPassword de password-utils
    const hashedPassword = await hashPassword(newPassword);

    // Actualizar contraseña
    await user.update({ Password: hashedPassword });

    // Notificar por email en background (igual que resetPassword)
    Promise.resolve()
      .then(async () => {
        const { sendPasswordChangedEmail } = await import('../../helpers/email-service.js');
        return sendPasswordChangedEmail(user.Email, user.Name);
      })
      .catch((err) => console.error('Error sending password changed email:', err));

    return res.status(200).json({
      success: true,
      message: 'Contraseña actualizada exitosamente',
    });
  } catch (error) {
    console.error('Error in changePassword controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al cambiar la contraseña',
      error: error.message,
    });
  }
});