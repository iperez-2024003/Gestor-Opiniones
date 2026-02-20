'use strict';

import { User } from '../users/user.model.js';
import Publication from '../publication/publication.model.js';
import Comment from '../comment/comment.model.js';

// Un usuario puede tener muchas publicaciones
User.hasMany(Publication, { foreignKey: 'author_id', as: 'publications' });
Publication.belongsTo(User, { foreignKey: 'author_id', as: 'author' });

// Una publicación puede tener muchos comentarios
Publication.hasMany(Comment, { foreignKey: 'publication_id', as: 'comments' });
Comment.belongsTo(Publication, { foreignKey: 'publication_id', as: 'publication' });

// Un usuario puede tener muchos comentarios
User.hasMany(Comment, { foreignKey: 'author_id', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'author_id', as: 'author' });

export { User, Publication, Comment };