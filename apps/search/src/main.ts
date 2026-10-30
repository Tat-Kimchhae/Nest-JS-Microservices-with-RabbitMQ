import { NestFactory } from '@nestjs/core';
import { SearchModule } from './search.module.js';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { applyToMicroserviceLayer } from '@app/rpc';

async function bootstrap() {
  process.title = 'Search';

  const logger = new Logger('Search Bootstrap');

  const rmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
  const queue = process.env.SEARCH_QUEUE || 'search_queue';

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    SearchModule,
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

  logger.log(`Search RMQ listening at queue ${queue} via ${rmqUrl}`);
}

await bootstrap();
