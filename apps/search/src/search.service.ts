import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  SearchProduct,
  SearchProductDocument,
} from './search-product.schema.js';

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(SearchProduct.name)
    private readonly searchProductModel: Model<SearchProductDocument>,
  ) {}

  async indexProduct(input: {
    productId: string;
    name: string;
    description: string;
    status: 'DRAFT' | 'ACTIVE';
    price: number;
  }) {
    const name = input.name ?? '';
    const description = input.description ?? '';
    return this.searchProductModel
      .findOneAndUpdate(
        { productId: input.productId },
        {
          ...input,
          normalizedText: `${name} ${description}`.toLowerCase(),
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      .exec();
  }

  async query(input: { q?: string; limit?: number }) {
    const q = input.q?.trim().toLowerCase() ?? '';
    if (!q) return [];

    const requestedLimit = Number(input.limit ?? 10);
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(20, Math.max(1, Math.trunc(requestedLimit)))
      : 10;
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    return this.searchProductModel
      .find({ normalizedText: { $regex: escaped, $options: 'i' } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .exec();
  }

  ping() {
    return {
      status: true,
      service: 'Search',
      now: new Date().toISOString(),
    };
  }
}
