import {
  DeleteResult,
  Document,
  FindCursor,
  InsertOneResult,
  ObjectId,
  UpdateResult,
} from 'mongodb';
import sanitize from 'mongo-sanitize';
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
  organizationId: string;
  warnings: WarningPersistence[];
  modifiedOn: number;
}

interface WarningsQueryFilter {
  selectorId?: string;
  createdOn?: { [key: string]: number };
}

interface SystemQueryFilter {
  name?: string;
  organizationId?: string;
  modifiedOn?: { [key: string]: number };
  warnings?: WarningsQueryFilter;
}

interface SystemUpdateFilter {
  $set: { [key: string]: any };
  $push: { [key: string]: any };
}

const collectionName = 'systems';

export default class SystemRepositoryImpl implements ISystemRepository {
  public findOne = async (id: string): Promise<System | null> => {
    const client = createClient();
    const db = await connect(client);
    const result: any = await db
      .collection(collectionName)
      .findOne({ _id: new ObjectId(sanitize(id)) });

    close(client);

    if (!result) return null;

    return this.#toEntity(this.#buildProperties(result));
  };

  public findBy = async (systemQueryDto: SystemQueryDto): Promise<System[]> => {
    try {
      if (!Object.keys(systemQueryDto).length) return await this.all();

      const client = createClient();
      const db = await connect(client);
      const result: FindCursor = await db
        .collection(collectionName)
        .find(this.#buildFilter(sanitize(systemQueryDto)));
      const results = await result.toArray();

      close(client);

      if (!results || !results.length) return [];

      return results.map((element: any) =>
        this.#toEntity(this.#buildProperties(element))
      );
    } catch (error: unknown) {
      if (typeof error === 'string') return Promise.reject(error);
      if (error instanceof Error) return Promise.reject(error.message);
      return Promise.reject(new Error('Unknown error occured'));
    }
  };

  #buildFilter = (systemQueryDto: SystemQueryDto): SystemQueryFilter => {
    const filter: { [key: string]: any } = {};

    if (systemQueryDto.name) filter.name = systemQueryDto.name;
    if (systemQueryDto.organizationId)
      filter.organizationId = systemQueryDto.organizationId;

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
    try {
      const db = await connect(client);
      const result: FindCursor = await db.collection(collectionName).find();
      const results = await result.toArray();

      close(client);

      if (!results || !results.length) return [];

      return results.map((element: any) =>
        this.#toEntity(this.#buildProperties(element))
      );
    } catch (error: unknown) {
      if (typeof error === 'string') return Promise.reject(error);
      if (error instanceof Error) return Promise.reject(error.message);
      return Promise.reject(new Error('Unknown error occured'));
    }
  };

  public insertOne = async (system: System): Promise<string> => {
    const client = createClient();
    try {
      const db = await connect(client);
      const result: InsertOneResult<Document> = await db
        .collection(collectionName)
        .insertOne(this.#toPersistence(sanitize(system)));

      if (!result.acknowledged)
        throw new Error('System creation failed. Insert not acknowledged');

      close(client);

      return result.insertedId.toHexString();
    } catch (error: unknown) {
      if (typeof error === 'string') return Promise.reject(error);
      if (error instanceof Error) return Promise.reject(error.message);
      return Promise.reject(new Error('Unknown error occured'));
    }
  };

  public updateOne = async (
    id: string,
    updateDto: SystemUpdateDto
  ): Promise<string> => {
    const client = createClient();
    try {
      const db = await connect(client);
      const result: Document | UpdateResult = await db
        .collection(collectionName)
        .updateOne(
          { _id: new ObjectId(sanitize(id)) },
          this.#buildUpdateFilter(sanitize(updateDto))
        );

      if (!result.acknowledged)
        throw new Error('System update failed. Update not acknowledged');

      close(client);

      return result.upsertedId;
    } catch (error: unknown) {
      if (typeof error === 'string') return Promise.reject(error);
      if (error instanceof Error) return Promise.reject(error.message);
      return Promise.reject(new Error('Unknown error occured'));
    }
  };

  #buildUpdateFilter = (
    systemUpdateDto: SystemUpdateDto
  ): SystemUpdateFilter => {
    const setFilter: { [key: string]: any } = {};
    const pushFilter: { [key: string]: any } = {};

    if (systemUpdateDto.name) setFilter.name = systemUpdateDto.name;
    if (systemUpdateDto.organizationId)
      setFilter.organizationId = systemUpdateDto.organizationId;
    if (systemUpdateDto.modifiedOn)
      setFilter.modifiedOn = systemUpdateDto.modifiedOn;

    if (systemUpdateDto.warning)
      pushFilter.warnings = this.#warningToPersistence(systemUpdateDto.warning);

    return { $set: setFilter, $push: pushFilter };
  };

  public deleteOne = async (id: string): Promise<string> => {
    const client = createClient();
    try {
      const db = await connect(client);
      const result: DeleteResult = await db
        .collection(collectionName)
        .deleteOne({ _id: new ObjectId(sanitize(id)) });

      if (!result.acknowledged)
        throw new Error('System delete failed. Delete not acknowledged');

      close(client);

      return result.deletedCount.toString();
    } catch (error: unknown) {
      if (typeof error === 'string') return Promise.reject(error);
      if (error instanceof Error) return Promise.reject(error.message);
      return Promise.reject(new Error('Unknown error occured'));
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
    organizationId: system.organizationId,
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
    organizationId: system.organizationId,
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
