'use strict';

import { Router } from 'express';
import { body } from 'express-validator';

import { validateJWT } from '../../middlewares/validate-JWT.js';
import { handleValidationErrors } from '../../middlewares/validation.js';

import {
  createPublication,
  getPublications,
  getPublicationById,
  updatePublication,
  deletePublication,
} from './publication.controller.js';

const router = Router();

// Validaciones para crear publicación
const validateCreatePublication = [
  body('title')
    .trim()
    .notEmpty().withMessage('El título es obligatorio')
    .isLength({ min: 3, max: 100 }).withMessage('El título debe tener entre 3 y 100 caracteres'),

  body('category')
    .trim()
    .notEmpty().withMessage('La categoría es obligatoria')
    .isIn(['Tecnología', 'Deportes', 'Política', 'Entretenimiento', 'Educación', 'Salud', 'Otro'])
    .withMessage('Categoría no válida. Opciones: Tecnología, Deportes, Política, Entretenimiento, Educación, Salud, Otro'),

  body('text')
    .trim()
    .notEmpty().withMessage('El texto principal es obligatorio')
    .isLength({ min: 10, max: 5000 }).withMessage('El texto debe tener entre 10 y 5000 caracteres'),

  handleValidationErrors,
];

// Validaciones para actualizar publicación (campos opcionales pero con formato)
const validateUpdatePublication = [
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('El título no puede estar vacío')
    .isLength({ min: 3, max: 100 }).withMessage('El título debe tener entre 3 y 100 caracteres'),

  body('category')
    .optional()
    .trim()
    .isIn(['Tecnología', 'Deportes', 'Política', 'Entretenimiento', 'Educación', 'Salud', 'Otro'])
    .withMessage('Categoría no válida. Opciones: Tecnología, Deportes, Política, Entretenimiento, Educación, Salud, Otro'),

  body('text')
    .optional()
    .trim()
    .notEmpty().withMessage('El texto no puede estar vacío')
    .isLength({ min: 10, max: 5000 }).withMessage('El texto debe tener entre 10 y 5000 caracteres'),

  handleValidationErrors,
];

router.post('/', validateJWT, validateCreatePublication, createPublication);
router.get('/', validateJWT, getPublications);
router.get('/:id', validateJWT, getPublicationById);
router.put('/:id', validateJWT, validateUpdatePublication, updatePublication);
router.delete('/:id', validateJWT, deletePublication);

export default router;
