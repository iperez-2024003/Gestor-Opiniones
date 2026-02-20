'use strict';

import Publication from './publication.model.js';
import Comment from '../comment/comment.model.js';
import { User } from '../users/user.model.js'; // named import

// ─── POST /api/v1/publications ───────────────────────────────────────────────
export const createPublication = async (req, res) => {
  try {
    const { title, category, text } = req.body;

    if (!title || !category || !text) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son obligatorios: título, categoría y texto',
      });
    }

    const publication = await Publication.create({
      title,
      category,
      text,
      author_id: req.user.Id,
    });

    const result = await Publication.findByPk(publication.id, {
      include: [{ model: User, as: 'author', attributes: ['Id', 'Username', 'Email'] }],
    });

    return res.status(201).json({
      success: true,
      message: 'Publicación creada exitosamente',
      publication: result,
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: error.errors.map((e) => e.message),
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Error al crear la publicación',
      error: error.message,
    });
  }
};

// ─── GET /api/v1/publications ────────────────────────────────────────────────
export const getPublications = async (req, res) => {
  try {
    const publications = await Publication.findAll({
      include: [{ model: User, as: 'author', attributes: ['Id', 'Username', 'Email'] }],
      order: [['created_at', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      total: publications.length,
      publications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener las publicaciones',
      error: error.message,
    });
  }
};

// ─── GET /api/v1/publications/:id ────────────────────────────────────────────
export const getPublicationById = async (req, res) => {
  try {
    const { id } = req.params;

    const publication = await Publication.findByPk(id, {
      include: [
        { model: User, as: 'author', attributes: ['Id', 'Username', 'Email'] },
        {
          model: Comment,
          as: 'comments',
          include: [{ model: User, as: 'author', attributes: ['Id', 'Username', 'Email'] }],
        },
      ],
    });

    if (!publication) {
      return res.status(404).json({
        success: false,
        message: 'Publicación no encontrada',
      });
    }

    return res.status(200).json({ success: true, publication });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener la publicación',
      error: error.message,
    });
  }
};

// ─── PUT /api/v1/publications/:id ────────────────────────────────────────────
export const updatePublication = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, text } = req.body;

    if (!title && !category && !text) {
      return res.status(400).json({
        success: false,
        message: 'Debes enviar al menos un campo para actualizar',
      });
    }

    const publication = await Publication.findByPk(id);

    if (!publication) {
      return res.status(404).json({
        success: false,
        message: 'Publicación no encontrada',
      });
    }

    if (publication.author_id !== req.user.Id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para editar esta publicación',
      });
    }

    await publication.update({
      ...(title && { title }),
      ...(category && { category }),
      ...(text && { text }),
    });

    const result = await Publication.findByPk(id, {
      include: [{ model: User, as: 'author', attributes: ['Id', 'Username', 'Email'] }],
    });

    return res.status(200).json({
      success: true,
      message: 'Publicación actualizada exitosamente',
      publication: result,
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: error.errors.map((e) => e.message),
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar la publicación',
      error: error.message,
    });
  }
};

// ─── DELETE /api/v1/publications/:id ─────────────────────────────────────────
export const deletePublication = async (req, res) => {
  try {
    const { id } = req.params;

    const publication = await Publication.findByPk(id);

    if (!publication) {
      return res.status(404).json({
        success: false,
        message: 'Publicación no encontrada',
      });
    }

    if (publication.author_id !== req.user.Id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para eliminar esta publicación',
      });
    }

    // Eliminar comentarios asociados primero
    await Comment.destroy({ where: { publication_id: id } });
    await publication.destroy();

    return res.status(200).json({
      success: true,
      message: 'Publicación eliminada exitosamente',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar la publicación',
      error: error.message,
    });
  }
};