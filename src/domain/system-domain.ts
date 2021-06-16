import { CreateSystem } from './system/create-system';
import { CreateWarning } from './warning/create-warning';
import { ReadSystem } from './system/read-system';
import { UpdateSystem } from './system/update-system';

export default class SystemDomain {
  #createSystem: CreateSystem;

  #updateSystem: UpdateSystem;

  #createWarning: CreateWarning;

  #readSystem: ReadSystem;

  public get createSystem(): CreateSystem {
    return this.#createSystem;
  }

  public get updateSystem(): UpdateSystem {
    return this.#updateSystem;
  }

  public get createWarning(): CreateWarning {
    return this.#createWarning;
  }

  public get readSystem(): ReadSystem {
    return this.#readSystem;
  }

  constructor(
    createSystem: CreateSystem,
    updateSystem: UpdateSystem,
    createWarning: CreateWarning,
    readSystem: ReadSystem
  ) {
    this.#createSystem = createSystem;
    this.#updateSystem = updateSystem;
    this.#readSystem = readSystem;
    this.#createWarning = createWarning;
  }
}
