'use strict';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { dbConnection } from './db.js';


import '../src/users/user.model.js';
import '../src/auth/role.model.js';
// Modelos del Laboratorio #2
import '../src/publication/publication.model.js';
import '../src/comment/comment.model.js';
// Asociaciones (relaciones entre Publication, Comment y User)
import '../src/publication/associations.js';


import { requestLimit } from '../middlewares/request-limit.js';
import { corsOptions } from './cors-configuration.js';
import { helmetConfiguration } from './helmet-configuration.js';
import {
  errorHandler,
  notFound,
} from '../middlewares/server-genericError-handler.js';


import authRoutes from '../src/auth/auth.routes.js';
import userRoutes from '../src/users/user.routes.js';
// Rutas del Laboratorio #2
import publicationRoutes from '../src/publication/publication.routes.js';
import commentRoutes from '../src/comment/comment.routes.js';


const BASE_PATH = '/api/v1';

const middlewares = (app) => {
  app.use(express.urlencoded({ extended: false, limit: '10mb' }));
  app.use(express.json({ limit: '10mb' }));
  app.use(cors(corsOptions));
  app.use(helmet(helmetConfiguration));
  app.use(requestLimit);
  app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
};

const routes = (app) => {
  app.use(`${BASE_PATH}/auth`, authRoutes);
  app.use(`${BASE_PATH}/users`, userRoutes);
  // Rutas del Laboratorio #2
  app.use(`${BASE_PATH}/publications`, publicationRoutes);
  app.use(`${BASE_PATH}/comments`, commentRoutes);

  app.get(`${BASE_PATH}/health`, (req, res) => {
    res.status(200).json({
      status: 'Healthy',
      timestamp: new Date().toISOString(),
      service: 'Gestion Opiniones Service',
    });
  });

  app.use(notFound);
};

export const initServer = async () => {
  const app = express();
  const PORT = process.env.PORT;
  app.set('trust proxy', 1);

  try {
    await dbConnection();
    const { seedRoles } = await import('../helpers/role-seed.js');
    await seedRoles();
    middlewares(app);
    routes(app);

    app.use(errorHandler);

    app.listen(PORT, () => {
      console.log(`Gestion Opiniones Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}${BASE_PATH}/health`);
    });
  } catch (err) {
    console.error(`Error starting server: ${err.message}`);
    process.exit(1);
  }
};