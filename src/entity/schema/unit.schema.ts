import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UnitsDocument = HydratedDocument<Units>;

export
@Schema({ timestamps: true })
class Units {
  @Prop({ required: true })
    amount: number;
}

export const UnitSchema = SchemaFactory.createForClass(Units);
