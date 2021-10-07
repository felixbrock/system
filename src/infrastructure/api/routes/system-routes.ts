import { Router } from 'express';
import CreateSystemController from '../controllers/create-system-controller';
import ReadSystemController from '../controllers/read-system-controller';
import app from '../../ioc-register';
import SystemDomain from '../../../domain/system-domain';
import CreateWarningController from '../controllers/create-warning-controller';
import DeleteSystemController from '../controllers/delete-system-controller';

const systemRoutes = Router();
const systemDomain: SystemDomain = app.systemMain;

const readSystemController = new ReadSystemController(systemDomain.readSystem, app.container.resolve('getAccounts'));

const createSystemController = new CreateSystemController(
  systemDomain.createSystem, app.container.resolve('getAccounts')
);

const deleteSystemController = new DeleteSystemController(
  systemDomain.deleteSystem, app.container.resolve('getAccounts')
);

const createWarningController = new CreateWarningController(
  systemDomain.createWarning, app.container.resolve('getAccounts')
);

systemRoutes.post('/', (req, res) => createSystemController.execute(req, res));

systemRoutes.get('/:systemId', (req, res) =>
  readSystemController.execute(req, res)
);

systemRoutes.post('/:systemId/warning', (req, res) =>
  createWarningController.execute(req, res)
);

systemRoutes.delete('/:systemId', (req, res) =>
  deleteSystemController.execute(req, res)
);

export default systemRoutes;
