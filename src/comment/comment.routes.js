'use strict';

import { Router } from 'express';
import { body } from 'express-validator';

import { validateJWT } from '../../middlewares/validate-JWT.js';
import { handleValidationErrors } from '../../middlewares/validation.js';

import {
  createComment,
  getCommentsByPublication,
  updateComment,
  deleteComment,
} from './comment.controller.js';

const router = Router();

// Validaciones para crear comentario
const validateCreateComment = [
  body('text')
    .trim()
    .notEmpty().withMessage('El texto del comentario es obligatorio')
    .isLength({ min: 2, max: 500 }).withMessage('El comentario debe tener entre 2 y 500 caracteres'),

  handleValidationErrors,
];

// Validaciones para editar comentario
const validateUpdateComment = [
  body('text')
    .trim()
    .notEmpty().withMessage('El texto del comentario es obligatorio')
    .isLength({ min: 2, max: 500 }).withMessage('El comentario debe tener entre 2 y 500 caracteres'),

  handleValidationErrors,
];

// Crear comentario en una publicación específica
router.post('/:publicationId', validateJWT, validateCreateComment, createComment);

// Obtener todos los comentarios de una publicación
router.get('/:publicationId', validateJWT, getCommentsByPublication);

// Editar un comentario por su ID
router.put('/:id', validateJWT, validateUpdateComment, updateComment);

// Eliminar un comentario por su ID
router.delete('/:id', validateJWT, deleteComment);

export default router;
