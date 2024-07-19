import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';

export type UnitsDocument = HydratedDocument<Units>;

export
@Schema({ timestamps: true })
class Units {
  @Prop({ required: true })
  @ApiProperty()
  amount: number;
}

export const UnitSchema = SchemaFactory.createForClass(Units);
