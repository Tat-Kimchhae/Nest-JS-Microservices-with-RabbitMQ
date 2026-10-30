import { NestFactory } from '@nestjs/core';
import { MediaModule } from './media.module.js';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { applyToMicroserviceLayer } from '@app/rpc';

async function bootstrap() {
  process.title = 'Media';

  const logger = new Logger('Media Bootstrap');

  const rmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
  const queue = process.env.MEDIA_QUEUE || 'media_queue';

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    MediaModule,
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

  logger.log(`Media RMQ listening at queue ${queue} via ${rmqUrl}`);
}

await bootstrap();
