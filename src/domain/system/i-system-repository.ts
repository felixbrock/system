import { System } from "../entities";
import Result from "../value-types/transient-types";

export default interface ISystemRepository {
  findOne(id: string): Promise<System | null>;
  findByName(name: string): Promise<System | null>;
  update(system: System): Promise<Result<null>>;
  save(system: System): Promise<Result<null>>;
  delete(systemId: string): Promise<Result<null>>;
  // eslint-disable-next-line semi
}