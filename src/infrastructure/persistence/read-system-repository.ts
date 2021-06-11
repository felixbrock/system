import fs from 'fs';
import path from 'path';
import {
  ReadSystemDto,
  IReadSystemRepository,
} from '../../domain/use-cases/read-system';

export default class ReadSystemRepositoryImpl
  implements IReadSystemRepository
{
  public findById = async (id: string): Promise<ReadSystemDto | null> => {
    const data: string = fs.readFileSync(
      path.resolve(__dirname, '../../../db.json'),
      'utf-8'
    );
    const db = JSON.parse(data);

    const result = db.systems.find(
      (systemEntity: { id: string }) => systemEntity.id === id
    );

    return result || null;
  };
}
