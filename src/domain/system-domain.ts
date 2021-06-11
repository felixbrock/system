import { CreateSystem } from './use-cases/create-system';
import { ReadSystem } from './use-cases/read-system';

export default class SystemDomain {
  #createSystem: CreateSystem;
  
  #readSystem: ReadSystem;

  public get createSystem(): CreateSystem {
    return this.#createSystem;
  }

  public get readSystem() : ReadSystem {
    return this.#readSystem;
  }

  constructor(createSystem: CreateSystem, readSystem : ReadSystem) {
    this.#createSystem = createSystem;
    this.#readSystem = readSystem;
  }
}
