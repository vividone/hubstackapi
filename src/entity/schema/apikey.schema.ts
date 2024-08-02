import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ApiKeyDocument = HydratedDocument<ApiKey>;

export
@Schema({ timestamps: true })
class ApiKey {
  @Prop()
  appName: string;

  @Prop()
  secretKey: string;
}

export const ApiKeySchema = SchemaFactory.createForClass(ApiKey);
