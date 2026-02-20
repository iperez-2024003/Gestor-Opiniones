'use strict';

import { DataTypes } from 'sequelize';
import { sequelize } from '../../configs/db.js';

const Publication = sequelize.define(
  'Publication',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'El título no puede estar vacío' },
        len: {
          args: [3, 100],
          msg: 'El título debe tener entre 3 y 100 caracteres',
        },
      },
    },
    category: {
      type: DataTypes.ENUM(
        'Tecnología',
        'Deportes',
        'Política',
        'Entretenimiento',
        'Educación',
        'Salud',
        'Otro'
      ),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'La categoría no puede estar vacía' },
        isIn: {
          args: [['Tecnología', 'Deportes', 'Política', 'Entretenimiento', 'Educación', 'Salud', 'Otro']],
          msg: 'Categoría no válida. Opciones: Tecnología, Deportes, Política, Entretenimiento, Educación, Salud, Otro',
        },
      },
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'El texto principal no puede estar vacío' },
        len: {
          args: [10, 5000],
          msg: 'El texto debe tener entre 10 y 5000 caracteres',
        },
      },
    },
    author_id: {
      type: DataTypes.STRING(16), // Igual que User.Id
      allowNull: false,
    },
  },
  {
    tableName: 'publications',
    timestamps: true,
    underscored: true,
  }
);

export default Publication;