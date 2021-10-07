import { Router } from 'express';
import app from '../../ioc-register';
import SystemDomain from '../../../domain/system-domain';
import ReadSystemsController from '../controllers/read-systems-controller';

const systemsRoutes = Router();
const systemDomain: SystemDomain = app.systemMain;

const readSystemsController = new ReadSystemsController(
  systemDomain.readSystems, app.container.resolve('getAccounts')
);

systemsRoutes.get('/', (req, res) =>
readSystemsController.execute(req, res)
);

export default systemsRoutes;
