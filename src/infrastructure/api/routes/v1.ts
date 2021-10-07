import { Router } from 'express';
import { apiRoot } from '../../../config';
import systemRoutes from './system-routes';
import systemsRoutes from './systems-routes';

const version = 'v1';

const v1Router = Router();

v1Router.get('/', (req, res) => res.json({ message: "Yo! We're up!" }));

v1Router.use(`/${apiRoot}/${version}/system`, systemRoutes);

v1Router.use(`/${apiRoot}/${version}/systems`, systemsRoutes);

export default v1Router;
