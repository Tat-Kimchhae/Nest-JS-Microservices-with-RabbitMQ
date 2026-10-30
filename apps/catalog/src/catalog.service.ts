import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isObjectIdOrHexString, Model } from 'mongoose';
import { rpcBadRequest, rpcNotFound } from '@app/rpc';
import { Product, ProductDocument } from './product.schema.js';
import { ProductEventsPublisher } from './product-events.publisher.js';

@Injectable()
export class CatalogService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    private readonly eventsPublisher: ProductEventsPublisher,
  ) {}

  async create(input: {
    name: string;
    description: string;
    price: number;
    status?: string;
    imageUrl?: string;
    createdByClerkUserId: string;
  }) {
    if (!input.name?.trim() || !input.description?.trim()) {
      rpcBadRequest('Name and description are required');
    }
    if (
      typeof input.price !== 'number' ||
      !Number.isFinite(input.price) ||
      input.price < 0
    ) {
      rpcBadRequest('Price must be a number greater than or equal to zero');
    }
    if (
      input.status !== undefined &&
      !['DRAFT', 'ACTIVE'].includes(input.status)
    ) {
      rpcBadRequest('Status must be DRAFT or ACTIVE');
    }

    const product = await this.productModel.create({
      ...input,
      name: input.name.trim(),
      description: input.description.trim(),
      status: input.status ?? 'DRAFT',
    });
    await this.eventsPublisher.publishCreated(product);
    return product;
  }

  list() {
    return this.productModel.find().sort({ createdAt: -1 }).lean().exec();
  }

  async getById(id: string) {
    if (!isObjectIdOrHexString(id)) rpcBadRequest('Invalid product id');
    const product = await this.productModel.findById(id).lean().exec();
    if (!product) rpcNotFound('Product not found', { id });
    return product;
  }

  ping() {
    return {
      status: true,
      service: 'Catalog',
      now: new Date().toISOString(),
    };
  }
}
