'use strict';

import { DataTypes } from 'sequelize';
import { sequelize } from '../../configs/db.js';

const Comment = sequelize.define(
  'Comment',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'El texto del comentario no puede estar vacío' },
        len: {
          args: [2, 500],
          msg: 'El comentario debe tener entre 2 y 500 caracteres',
        },
      },
    },
    publication_id: {
      type: DataTypes.UUID, // FK a Publication.id
      allowNull: false,
    },
    author_id: {
      type: DataTypes.STRING(16), // FK a User.Id
      allowNull: false,
    },
  },
  {
    tableName: 'comments',
    timestamps: true,
    underscored: true,
  }
);

export default Comment;