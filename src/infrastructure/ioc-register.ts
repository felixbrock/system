import { InjectionMode, asClass, createContainer } from 'awilix';

import { CreateSystem } from '../domain/system/create-system';
import { ReadSystem } from '../domain/system/read-system';

import SystemRepository from './persistence/system-repository';

import SystemDomain from '../domain/system-domain';
import { CreateWarning } from '../domain/warning/create-warning';
import { UpdateSystem } from '../domain/system/update-system';
import { DeleteSystem } from '../domain/system/delete-system';
import { DeleteSelectors } from '../domain/selector-api/delete-selectors';
import SelectorApiRepository from './persistence/selector-api-repository';

const iocRegister = createContainer({ injectionMode: InjectionMode.CLASSIC });

iocRegister.register({
  systemDomain: asClass(SystemDomain),

  readSystem: asClass(ReadSystem),
  createSystem: asClass(CreateSystem),
  updateSystem: asClass(UpdateSystem),
  deleteSystem: asClass(DeleteSystem),

  createWarning: asClass(CreateWarning),

  deleteSelectors: asClass(DeleteSelectors),

  systemRepository: asClass(SystemRepository),
  selectorApiRepository: asClass(SelectorApiRepository)
});

const systemMain = iocRegister.resolve<SystemDomain>('systemDomain');

export default {
  systemMain,
  container: iocRegister,
};
