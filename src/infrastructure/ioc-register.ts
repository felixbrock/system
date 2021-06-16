import { InjectionMode, asClass, createContainer } from 'awilix';

import { CreateSystem } from '../domain/system/create-system';
import { ReadSystem } from '../domain/system/read-system';

import SystemRepository from './persistence/system-repository';

import SystemDomain from '../domain/system-domain';
import { CreateWarning } from '../domain/warning/create-warning';
import { UpdateSystem } from '../domain/system/update-system';

const iocRegister = createContainer({ injectionMode: InjectionMode.CLASSIC });

iocRegister.register({
  systemDomain: asClass(SystemDomain),

  createSystem: asClass(CreateSystem),
  updateSystem: asClass(UpdateSystem),
  readSystem: asClass(ReadSystem),

  createWarning: asClass(CreateWarning),

  systemRepository: asClass(SystemRepository),
});

const systemMain = iocRegister.resolve<SystemDomain>('systemDomain');

export default {
  systemMain,
  container: iocRegister,
};
