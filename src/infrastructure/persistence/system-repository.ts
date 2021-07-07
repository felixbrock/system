import fs from 'fs';
import path from 'path';
import { System, SystemProperties } from '../../domain/entities/system';
import {
  ISystemRepository,
  SystemQueryDto,
  WarningQueryDto,
} from '../../domain/system/i-system-repository';
import {Warning} from '../../domain/value-types/warning';
import Result from '../../domain/value-types/transient-types/result';

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
  public findOne = async (id: string): Promise<System | null> => {
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

  public async findBy(systemQueryDto: SystemQueryDto): Promise<System[]> {
    if (!Object.keys(systemQueryDto).length) return this.all();

    const data: string = fs.readFileSync(
      path.resolve(__dirname, '../../../db.json'),
      'utf-8'
    );
    const db = JSON.parse(data);

    const systems: SystemPersistence[] = db.systems.filter(
      (systemEntity: SystemPersistence) =>
        this.findByCallback(systemEntity, systemQueryDto)
    );

    if (!systems || !!systems.length) return [];
    return systems.map((system: SystemPersistence) =>
      this.#toEntity(this.#buildProperties(system))
    );
  }

  // eslint-disable-next-line class-methods-use-this
  private findByCallback(
    systemEntity: SystemPersistence,
    systemQueryDto: SystemQueryDto
  ): boolean {
    const nameMatch = systemQueryDto.name
      ? systemEntity.name === systemQueryDto.name
      : true;
    const modifiedOnMatch = systemQueryDto.modifiedOn
      ? systemEntity.modifiedOn === systemQueryDto.modifiedOn
      : true;

    let warningMatch: boolean;
    if (systemQueryDto.warning === true) {
      const queryTarget: WarningQueryDto = systemQueryDto.warning;
      const result: WarningPersistence | undefined = systemEntity.warnings.find(
        (warning: WarningPersistence) =>
          queryTarget.createdOn
            ? warning.createdOn === queryTarget.createdOn
            : true
      );
      warningMatch = !!result;
    } else warningMatch = true;

    return nameMatch && modifiedOnMatch && warningMatch;
  }

  all = async (): Promise<System[]> => {
    const data: string = fs.readFileSync(
      path.resolve(__dirname, '../../../db.json'),
      'utf-8'
    );
    const db = JSON.parse(data);

    const { systems } = db;

    if (!systems || !systems.length) return [];
    return systems.map((system: SystemPersistence) =>
      this.#toEntity(this.#buildProperties(system))
    );
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

  // eslint-disable-next-line class-methods-use-this
  public async delete(id: string): Promise<Result<null>> {
    const data: string = fs.readFileSync(
      path.resolve(__dirname, '../../../db.json'),
      'utf-8'
    );
    const db = JSON.parse(data);

    try {
      const systems: SystemPersistence[] = db.systems.filter(
        (systemEntity: { id: string }) => systemEntity.id !== id
      );

      if (systems.length === db.systems.length)
        throw new Error(`System with id ${id} does not exist`);

      db.systems = systems;

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

  #toEntity = (systemProperties: SystemProperties): System => {
    const createSystemResult: Result<System> = System.create(systemProperties);

    if (createSystemResult.error) throw new Error(createSystemResult.error);
    if (!createSystemResult.value) throw new Error('System creation failed');

    return createSystemResult.value;
  };

  #buildProperties = (system: SystemPersistence): SystemProperties => ({
    id: system.id,
    name: system.name,
    modifiedOn: system.modifiedOn,
    warnings: system.warnings.map((warning) => {
      const warningResult = Warning.create({ createdOn: warning.createdOn });
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
