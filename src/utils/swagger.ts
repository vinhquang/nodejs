import {Express, Request, Response} from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
const {version} = require('../../package.json');
const postman = require('../../postman_collection.json');

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'REST API Docs',
      version,
    },
    components: {
      securitySchemas: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/modules/api/api.routes.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

/**
 * Initial sưagger
 * @param {Express} app
 * @param {Int} port
 */
function swaggerDocs(app: Express, port: number) {
  // Swagger page
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Docs in JSON format
  app.get('/docs.json', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.json(swaggerSpec);
  });

  // Docs in JSON format
  app.get('/postman.json', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.json(postman);
  });

  console.log(`Docs available at http://localhost:${port}/docs`);
}

export default swaggerDocs;
