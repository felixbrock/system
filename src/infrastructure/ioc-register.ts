import { InjectionMode, asClass, createContainer } from 'awilix';

import { CreateSystem } from '../domain/use-cases/create-system';
import { ReadSystem } from '../domain/use-cases/read-system';

import CreateSystemRepository from './persistence/create-system-repository';
import ReadSystemRepository from './persistence/read-system-repository';

import SystemDomain from '../domain/system-domain';

const iocRegister = createContainer({ injectionMode: InjectionMode.CLASSIC });

iocRegister.register({
  systemDomain: asClass(SystemDomain),

  createSystem: asClass(CreateSystem),
  readSystem: asClass(ReadSystem),

  createSystemRepository: asClass(CreateSystemRepository),
  readSystemRepository: asClass(ReadSystemRepository),
});

const systemMain = iocRegister.resolve<SystemDomain>('systemDomain');

export default {
  systemMain,
  container: iocRegister,
};
