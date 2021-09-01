import {
  DeleteResult,
  Document,
  FindCursor,
  InsertOneResult,
  ObjectId,
  UpdateResult,
} from 'mongodb';
import { System, SystemProperties } from '../../domain/entities/system';
import {
  ISystemRepository,
  SystemQueryDto,
  SystemUpdateDto,
} from '../../domain/system/i-system-repository';
import { Warning } from '../../domain/value-types/warning';
import Result from '../../domain/value-types/transient-types/result';
import { close, connect, createClient } from './db/mongo-db';

interface WarningPersistence {
  createdOn: number;
  selectorId: string;
}

interface SystemPersistence {
  _id: string;
  name: string;
  warnings: WarningPersistence[];
  modifiedOn: number;
  // eslint-disable-next-line semi
}

const collectionName = 'systems';

export default class SystemRepositoryImpl implements ISystemRepository {
  public findOne = async (id: string): Promise<System | null> => {
    const client = createClient();
    const db = await connect(client);
    const result: any = await db
      .collection(collectionName)
      .findOne({ _id: new ObjectId(id) });

    close(client);

    if (!result) return null;

    return this.#toEntity(this.#buildProperties(result));
  };

  public findBy = async (systemQueryDto: SystemQueryDto): Promise<System[]> => {
    if (!Object.keys(systemQueryDto).length) return this.all();

    const client = createClient();
    const db = await connect(client);
    const result: FindCursor = await db
      .collection(collectionName)
      .find(this.#buildFilter(systemQueryDto));
    const results = await result.toArray();

    close(client);

    if (!results || !results.length) return [];

    return results.map((element: any) =>
      this.#toEntity(this.#buildProperties(element))
    );
  };

  #buildFilter = (systemQueryDto: SystemQueryDto): any => {
    const filter: { [key: string]: any } = {};

    if (systemQueryDto.name) filter.name = systemQueryDto.name;

    const modifiedOnFilter: { [key: string]: number } = {};
    if (systemQueryDto.modifiedOnStart)
      modifiedOnFilter.$gte = systemQueryDto.modifiedOnStart;
    if (systemQueryDto.modifiedOnEnd)
      modifiedOnFilter.$lte = systemQueryDto.modifiedOnEnd;
    if (Object.keys(modifiedOnFilter).length)
      filter.modifiedOn = modifiedOnFilter;

    if (!systemQueryDto.warning || !Object.keys(systemQueryDto.warning).length)
      return filter;

    const warningCreatedOnFilter: { [key: string]: number } = {};
    if (systemQueryDto.warning.createdOnStart)
      warningCreatedOnFilter.$gte = systemQueryDto.warning.createdOnStart;
    if (systemQueryDto.warning.createdOnEnd)
      warningCreatedOnFilter.$lte = systemQueryDto.warning.createdOnEnd;
    if (Object.keys(warningCreatedOnFilter).length)
      filter['warnings.createdOn'] = warningCreatedOnFilter;

    if (systemQueryDto.warning.selectorId)
      filter['warnings.selectorId'] = systemQueryDto.warning.selectorId;

    return filter;
  };

  public all = async (): Promise<System[]> => {
    const client = createClient();
    const db = await connect(client);
    const result: FindCursor = await db.collection(collectionName).find();
    const results = await result.toArray();

    close(client);

    if (!results || !results.length) return [];

    return results.map((element: any) =>
      this.#toEntity(this.#buildProperties(element))
    );
  };

  public insertOne = async (system: System): Promise<Result<null>> => {
    try {
      const client = createClient();
      const db = await connect(client);
      const result: InsertOneResult<Document> = await db
        .collection(collectionName)
        .insertOne(this.#toPersistence(system));

      if (!result.acknowledged)
        throw new Error('System creation failed. Insert not acknowledged');

      close(client);

      return Result.ok<null>();
    } catch (error) {
      return Result.fail<null>(typeof error === 'string' ? error : error.message);
    }
  };

  public updateOne = async (
    id: string,
    updateDto: SystemUpdateDto
  ): Promise<Result<null>> => {
    try {
      const client = createClient();
      const db = await connect(client);
      const result: Document | UpdateResult = await db
        .collection(collectionName)
        .updateOne(
          { _id: new ObjectId(id) },
          this.#buildUpdateFilter(updateDto)
        );

      if (!result.acknowledged)
        throw new Error('System update failed. Update not acknowledged');

      close(client);

      return Result.ok<null>();
    } catch (error) {
      return Result.fail<null>(typeof error === 'string' ? error : error.message);
    }
  };

  #buildUpdateFilter = (systemUpdateDto: SystemUpdateDto): any => {
    const filter: { [key: string]: any } = {};
    const setFilter: { [key: string]: any } = {};
    const pushFilter: { [key: string]: any } = {};

    if (systemUpdateDto.name) filter.name = systemUpdateDto.name;
    if (systemUpdateDto.modifiedOn)
      filter.modifiedOn = systemUpdateDto.modifiedOn;

    if (systemUpdateDto.warning)
      pushFilter.warnings = this.#warningToPersistence(systemUpdateDto.warning);

    if (Object.keys(setFilter).length) filter.$set = setFilter;
    if (Object.keys(pushFilter).length) filter.$push = pushFilter;
  };

  public deleteOne = async (id: string): Promise<Result<null>> => {
    try {
      const client = createClient();
      const db = await connect(client);
      const result: DeleteResult = await db
        .collection(collectionName)
        .deleteOne({ _id: new ObjectId(id) });

      if (!result.acknowledged)
        throw new Error('System delete failed. Delete not acknowledged');

      close(client);

      return Result.ok<null>();
    } catch (error) {
      return Result.fail<null>(typeof error === 'string' ? error : error.message);
    }
  };

  #toEntity = (systemProperties: SystemProperties): System => {
    const createSystemResult: Result<System> = System.create(systemProperties);

    if (createSystemResult.error) throw new Error(createSystemResult.error);
    if (!createSystemResult.value) throw new Error('System creation failed');

    return createSystemResult.value;
  };

  #buildProperties = (system: SystemPersistence): SystemProperties => ({
    // eslint-disable-next-line no-underscore-dangle
    id: system._id,
    name: system.name,
    modifiedOn: system.modifiedOn,
    warnings: system.warnings.map((warning) => {
      const warningResult = Warning.create({
        createdOn: warning.createdOn,
        selectorId: warning.selectorId,
      });
      if (warningResult.value) return warningResult.value;
      throw new Error(
        warningResult.error || `Creation of system warning failed`
      );
    }),
  });

  #toPersistence = (system: System): Document => ({
    _id: ObjectId.createFromHexString(system.id),
    name: system.name,
    modifiedOn: system.modifiedOn,
    warnings: system.warnings.map(
      (warning): WarningPersistence => this.#warningToPersistence(warning)
    ),
  });

  #warningToPersistence = (warning: Warning): WarningPersistence => ({
    createdOn: warning.createdOn,
    selectorId: warning.selectorId,
  });
}
