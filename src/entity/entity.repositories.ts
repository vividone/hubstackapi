import { Document, FilterQuery, Model, UpdateQuery } from 'mongoose';

export abstract class EntityRepository<T extends Document> {
  constructor(protected readonly entityModel: Model<T>) {}

  async findOne(
    entityFilterQuery: FilterQuery<T>,
    projection?: Record<string, unknown>,
  ): Promise<any> {
    return this.entityModel
      .findOne(entityFilterQuery, {
        __v: 0,
        ...projection,
      })
      .populate(entityFilterQuery.populate && [...entityFilterQuery.populate]);
  }

  async find(
    entityFilterQuery?: FilterQuery<T>,
    projection?: Record<string, unknown>,
  ): Promise<T[] | null> {
    return (
      this.entityModel
        .find(entityFilterQuery, { __v: 0, ...projection })
        // .populate(entityFilterQuery.populate && [...entityFilterQuery.populate])
        .select('-password')
    );
    // .limit(entityFilterQuery.limit && entityFilterQuery?.limit);
  }

  async create(createEntityData: unknown): Promise<T> {
    return this.entityModel.create(createEntityData);
  }

  async findOneAndUpdate(
    entityFilterQuery: FilterQuery<T>,
    updateEntityData: UpdateQuery<unknown>,
  ): Promise<any> {
    return this.entityModel
      .findOneAndUpdate(entityFilterQuery, updateEntityData, {
        new: true,
        lean: true,
      })
      .populate(entityFilterQuery.populate && [...entityFilterQuery.populate]);
  }

  async findOneAndDelete(entityFilterQuery: FilterQuery<T>): Promise<boolean> {
    return this.entityModel.findOneAndDelete(entityFilterQuery);
  }

  async updateMany(
    entityFilterQuery: FilterQuery<T>,
    updateEntityData: UpdateQuery<unknown>,
  ): Promise<T[] | null> {
    return this.entityModel
      .updateMany(entityFilterQuery, updateEntityData, {
        new: true,
        lean: true,
      })
      .populate(entityFilterQuery.populate && [...entityFilterQuery.populate])
      .select('-password') as unknown as T[];
  }

  async countDocument(entityFilterQuery?: FilterQuery<T>): Promise<number> {
    return this.entityModel.countDocuments(entityFilterQuery);
  }

  async aggregate(pipeline: any[]): Promise<any[]> {
    return this.entityModel.aggregate(pipeline).exec();
  }
}
