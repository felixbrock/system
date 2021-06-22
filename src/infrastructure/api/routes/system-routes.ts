import { Router } from 'express';
import { CreateSystemController, ReadSystemController } from '../controllers';
import app from '../../ioc-register';
import SystemDomain from '../../../domain/system-domain';
import CreateWarningController from '../controllers/create-warning-controller';
import DeleteSystemController from '../controllers/delete-system-controller';

const systemRoutes = Router();
const systemDomain: SystemDomain = app.systemMain;

const readSystemController = new ReadSystemController(systemDomain.readSystem);

const createSystemController = new CreateSystemController(
  systemDomain.createSystem
);

const deleteSystemController = new DeleteSystemController(
  systemDomain.deleteSystem
);

const createWarningController = new CreateWarningController(
  systemDomain.createWarning
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
