import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CatalogController } from './catalog.controller.js';
import { CatalogService } from './catalog.service.js';
import { Product, ProductSchema } from './product.schema.js';
import { ProductEventsPublisher } from './product-events.publisher.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI_CATALOG ?? ''),
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    ClientsModule.register([
      {
        name: 'SEARCH_EVENTS_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
          queue: process.env.SEARCH_QUEUE || 'search_queue',
          queueOptions: { durable: false },
        },
      },
    ]),
  ],
  controllers: [CatalogController],
  providers: [CatalogService, ProductEventsPublisher],
})
export class CatalogModule {}
