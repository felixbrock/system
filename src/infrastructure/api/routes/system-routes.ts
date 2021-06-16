import { Router } from 'express';
import { CreateSystemController, ReadSystemController } from '../controllers';
import app from '../../ioc-register';
import SystemDomain from '../../../domain/system-domain';
import CreateWarningController from '../controllers/create-warning-controller';

const systemRoutes = Router();
const systemDomain: SystemDomain = app.systemMain;

const createSystemController = new CreateSystemController(
  systemDomain.createSystem
);
const readSystemController = new ReadSystemController(systemDomain.readSystem);
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

export default systemRoutes;
