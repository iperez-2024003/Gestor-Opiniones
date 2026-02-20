'use strict';

import Comment from './comment.model.js';
import Publication from '../publication/publication.model.js';
import { User } from '../users/user.model.js'; // named import

// ─── POST /api/v1/comments/:publicationId ────────────────────────────────────
export const createComment = async (req, res) => {
  try {
    const { publicationId } = req.params;
    const { text } = req.body;

    const publication = await Publication.findByPk(publicationId);
    if (!publication) {
      return res.status(404).json({
        success: false,
        message: 'Publicación no encontrada',
      });
    }

    const comment = await Comment.create({
      text,
      publication_id: publicationId,
      author_id: req.user.Id,
    });

    const result = await Comment.findByPk(comment.id, {
      include: [{ model: User, as: 'author', attributes: ['Id', 'Username', 'Email'] }],
    });

    return res.status(201).json({
      success: true,
      message: 'Comentario creado exitosamente',
      comment: result,
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
      message: 'Error al crear el comentario',
      error: error.message,
    });
  }
};

// ─── GET /api/v1/comments/:publicationId ─────────────────────────────────────
export const getCommentsByPublication = async (req, res) => {
  try {
    const { publicationId } = req.params;

    const publication = await Publication.findByPk(publicationId);
    if (!publication) {
      return res.status(404).json({
        success: false,
        message: 'Publicación no encontrada',
      });
    }

    const comments = await Comment.findAll({
      where: { publication_id: publicationId },
      include: [{ model: User, as: 'author', attributes: ['Id', 'Username', 'Email'] }],
      order: [['created_at', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      total: comments.length,
      comments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener los comentarios',
      error: error.message,
    });
  }
};

// ─── PUT /api/v1/comments/:id ─────────────────────────────────────────────────
export const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    const comment = await Comment.findByPk(id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comentario no encontrado',
      });
    }

    if (comment.author_id !== req.user.Id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para editar este comentario',
      });
    }

    await comment.update({ text });

    const result = await Comment.findByPk(id, {
      include: [{ model: User, as: 'author', attributes: ['Id', 'Username', 'Email'] }],
    });

    return res.status(200).json({
      success: true,
      message: 'Comentario actualizado exitosamente',
      comment: result,
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
      message: 'Error al actualizar el comentario',
      error: error.message,
    });
  }
};

// ─── DELETE /api/v1/comments/:id ──────────────────────────────────────────────
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findByPk(id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comentario no encontrado',
      });
    }

    if (comment.author_id !== req.user.Id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para eliminar este comentario',
      });
    }

    await comment.destroy();

    return res.status(200).json({
      success: true,
      message: 'Comentario eliminado exitosamente',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar el comentario',
      error: error.message,
    });
  }
};