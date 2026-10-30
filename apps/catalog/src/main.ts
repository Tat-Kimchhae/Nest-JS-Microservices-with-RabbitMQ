import { NestFactory } from '@nestjs/core';
import { CatalogModule } from './catalog.module.js';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { applyToMicroserviceLayer } from '@app/rpc';

async function bootstrap() {
  process.title = 'Catalog';

  const logger = new Logger('Catalog Bootstrap');

  const rmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
  const queue = process.env.CATALOG_QUEUE || 'catalog_queue';

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    CatalogModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [rmqUrl],
        queue: queue,
        queueOptions: {
          durable: false,
        },
      },
    },
  );

  applyToMicroserviceLayer(app);
  await app.listen();

  logger.log(`Catalog RMQ listening at queue ${queue} via ${rmqUrl}`);
}

await bootstrap();
