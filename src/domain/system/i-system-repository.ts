import { System } from "../entities";

export default interface ISystemRepository {
  findById(id: string): Promise<System | null>;
  findByName(name: string): Promise<System | null>;
  update(system: System): Promise<void>;
  save(system: System): Promise<void>;
  // eslint-disable-next-line semi
}