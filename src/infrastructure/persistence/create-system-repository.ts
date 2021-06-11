import fs from 'fs';
import path from 'path';
import { CreateSystemDto, ICreateSystemRepository } from '../../domain/use-cases/create-system';
import { System } from '../../domain/entities';

export default class CreateSelectorRepositoryImpl implements ICreateSystemRepository {
  public findByName = async (name: string): Promise<CreateSystemDto | null> => {
    const data: string = fs.readFileSync(
      path.resolve(__dirname, '../../../db.json'),
      'utf-8'
    );
    const db = JSON.parse(data);

    const result = db.systems.find(
      (systemEntity: { name: string }) => systemEntity.name === name
    );

    return result || null;
  };

  public async save(system: System): Promise<void> {
    const data: string = fs.readFileSync(
      path.resolve(__dirname, '../../../db.json'),
      'utf-8'
    );
    const db = JSON.parse(data);

    db.systems.push(this.#toPersistence(system));

    fs.writeFileSync(
      path.resolve(__dirname, '../../../db.json'),
      JSON.stringify(db),
      'utf-8'
    );
  }

  #toPersistence = (system: System): CreateSystemDto => ({
    id: system.id,
    name: system.name,
    createdOn: system.createdOn,
    modifiedOn: system.modifiedOn,
  });
}
