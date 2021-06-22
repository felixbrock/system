import fs from 'fs';
import path from 'path';
import { System, SystemProperties } from '../../domain/entities';
import ISystemRepository from '../../domain/system/i-system-repository';
import { Warning } from '../../domain/value-types';
import Result from '../../domain/value-types/transient-types';

interface WarningPersistence {
  createdOn: number;
}

interface SystemPersistence {
  id: string;
  name: string;
  warnings: WarningPersistence[];
  modifiedOn: number;
  // eslint-disable-next-line semi
}

export default class SystemRepositoryImpl implements ISystemRepository {
  public findById = async (id: string): Promise<System | null> => {
    const data: string = fs.readFileSync(
      path.resolve(__dirname, '../../../db.json'),
      'utf-8'
    );
    const db = JSON.parse(data);

    const result: SystemPersistence = db.systems.find(
      (systemEntity: { id: string }) => systemEntity.id === id
    );

    if (!result) return null;
    return this.#toEntity(this.#buildProperties(result));
  };

  public findByName = async (name: string): Promise<System | null> => {
    const data: string = fs.readFileSync(
      path.resolve(__dirname, '../../../db.json'),
      'utf-8'
    );
    const db = JSON.parse(data);

    const result = db.systems.find(
      (systemEntity: { name: string }) => systemEntity.name === name
    );

    if (!result) return null;
    return this.#toEntity(this.#buildProperties(result));
  };

  public async save(system: System): Promise<Result<null>> {
    const data: string = fs.readFileSync(
      path.resolve(__dirname, '../../../db.json'),
      'utf-8'
    );
    const db = JSON.parse(data);
    try {
      db.systems.push(this.#toPersistence(system));

      fs.writeFileSync(
        path.resolve(__dirname, '../../../db.json'),
        JSON.stringify(db),
        'utf-8'
      );

      return Result.ok<null>();
    } catch (error) {
      return Result.fail<null>(error.message);
    }
  }

  public async update(system: System): Promise<Result<null>> {
    const data: string = fs.readFileSync(
      path.resolve(__dirname, '../../../db.json'),
      'utf-8'
    );
    const db = JSON.parse(data);

    try {
      for (let i = 0; i < db.systems.length; i += 1) {
        if (db.systems[i].id === system.id) {
          db.systems[i] = this.#toPersistence(system);
          break;
        }
      }

      fs.writeFileSync(
        path.resolve(__dirname, '../../../db.json'),
        JSON.stringify(db),
        'utf-8'
      );

      return Result.ok<null>();
    } catch (error) {
      return Result.fail<null>(error.message);
    }
  }

  #toEntity = (systemProperties: SystemProperties): System | null =>
    System.create(systemProperties).value || null;

  #buildProperties = (system: SystemPersistence): SystemProperties => ({
    id: system.id,
    name: system.name,
    modifiedOn: system.modifiedOn,
    warnings: system.warnings.map((warning) => {
      const warningResult = Warning.create();
      if (warningResult.value) return warningResult.value;
      throw new Error(
        warningResult.error || `Creation of system warning ${warning} failed`
      );
    }),
  });

  #toPersistence = (system: System): SystemPersistence => ({
    id: system.id,
    name: system.name,
    modifiedOn: system.modifiedOn,
    warnings: system.warnings.map(
      (warning): WarningPersistence => ({
        createdOn: warning.createdOn,
      })
    ),
  });
}
