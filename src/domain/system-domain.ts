import { CreateSystem } from './system/create-system';
import { CreateWarning } from './warning/create-warning';
import { ReadSystem } from './system/read-system';
import { UpdateSystem } from './system/update-system';
import { DeleteSystem } from './system/delete-system';

export default class SystemDomain {
  #readSystem: ReadSystem;

  #createSystem: CreateSystem;

  #updateSystem: UpdateSystem;

  #deleteSystem: DeleteSystem;

  #createWarning: CreateWarning;

  public get readSystem(): ReadSystem {
    return this.#readSystem;
  }

  public get createSystem(): CreateSystem {
    return this.#createSystem;
  }

  public get updateSystem(): UpdateSystem {
    return this.#updateSystem;
  }

  public get deleteSystem(): DeleteSystem {
    return this.#deleteSystem;
  }

  public get createWarning(): CreateWarning {
    return this.#createWarning;
  }

  constructor(
    readSystem: ReadSystem,
    createSystem: CreateSystem,
    updateSystem: UpdateSystem,
    deleteSystem: DeleteSystem,
    createWarning: CreateWarning
  ) {
    this.#readSystem = readSystem;
    this.#createSystem = createSystem;
    this.#updateSystem = updateSystem;
    this.#deleteSystem = deleteSystem;
    this.#createWarning = createWarning;
  }
}
