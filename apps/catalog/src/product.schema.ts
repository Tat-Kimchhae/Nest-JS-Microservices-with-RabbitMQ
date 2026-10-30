import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true, enum: ['DRAFT', 'ACTIVE'], default: 'DRAFT' })
  status: 'DRAFT' | 'ACTIVE';

  @Prop()
  imageUrl?: string;

  @Prop({ required: true })
  createdByClerkUserId: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
