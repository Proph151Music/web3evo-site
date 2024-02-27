import '~/config'; // KEEP THIS ON TOP
import { PrismaClient } from '@prisma/client';
import express from 'express';
import handleAppError from '~/controllers/error-controller';
import appRouter from '~/router';
import cors from 'cors';
import { validateEnv } from '~/utils/app';
import cookieParser from 'cookie-parser';
import path from 'path';

export const prisma = new PrismaClient();
export const rootDir = path.dirname(__dirname);

(async () => {
  try {
    // Make sure all required environment variables are set
    validateEnv();

    const app = express();

    app.use(
      cors({
        origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:8000',
        credentials: true
      })
    );

    // to expose cookies from a request in route handlers
    app.use(cookieParser());

    // to expose the body from a request in the route handlers
    app.use(express.json({ limit: '20mb' }));

    // define the static directry
    // https://expressjs.com/en/starter/static-files.html
    app.use(express.static('public'));

    // Link the appRouter to the basepath
    app.use('/api/v1', appRouter);

    // Handle all routes that do not match /api/v1/**
    app.all('*', (req, res) => {
      res.status(404).json({
        error: {
          name: 'NotFoundError',
          message: `Path '${req.originalUrl}' does not exist.`
        }
      });
    });

    // Global error handler.
    // In case of an error, Express will automatically skip other middleware functions and runs this one
    app.use(handleAppError);

    await prisma.$connect();
    console.log(`Successfully connected to database`);

    // Default port is 80
    const port = process.env.SERVER_PORT ?? 80;
    const server = app.listen(port, () => {
      console.log(`Listening on port ${port}\n--------------------------`);
    });

    // This event is emitted by Express when an asynchronous code outside the app throws an error
    process.on('unhandledRejection', (err: Error) => {
      console.log('ERROR💥: An unhandled rejection occurred');
      console.log(`name: ${err.name}`);
      console.log(`message: ${err.message}`);

      server.closeAllConnections();
      server.close(async () => {
        await prisma.$disconnect();
        process.exit(1);
      });
    });
  } catch (e) {
    const error = e as Error;
    console.log('ERROR💥: An Uncaught Exception occurred!');
    console.log(`name: ${error.name}`);
    console.log(`message: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
})();
