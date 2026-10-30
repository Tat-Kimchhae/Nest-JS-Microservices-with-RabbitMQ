import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { Product } from './product.schema.js';

@Injectable()
export class ProductEventsPublisher implements OnModuleInit {
  private readonly logger = new Logger(ProductEventsPublisher.name);

  constructor(
    @Inject('SEARCH_EVENTS_CLIENT') private readonly client: ClientProxy,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.client.connect();
    } catch (error) {
      this.logger.error(
        'Failed to connect search event publisher',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  async publishCreated(product: Product & { _id: unknown }): Promise<void> {
    try {
      await lastValueFrom(
        this.client.emit('product.created', {
          productId: String(product._id),
          name: product.name,
          description: product.description,
          status: product.status,
          price: product.price,
          imageUrl: product.imageUrl,
          createdByClerkUserId: product.createdByClerkUserId,
        }),
      );
    } catch (error) {
      this.logger.error(
        'Failed to publish product.created event',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
