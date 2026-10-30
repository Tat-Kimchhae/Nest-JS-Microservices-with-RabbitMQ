import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SearchProductDocument = HydratedDocument<SearchProduct>;

@Schema({ timestamps: true })
export class SearchProduct {
  @Prop({ required: true, unique: true, index: true })
  productId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, index: true })
  normalizedText: string;

  @Prop({ required: true, enum: ['DRAFT', 'ACTIVE'] })
  status: 'DRAFT' | 'ACTIVE';

  @Prop({ required: true, min: 0 })
  price: number;
}

export const SearchProductSchema = SchemaFactory.createForClass(SearchProduct);
