import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module.js';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  process.title = 'Gateway';

  const logger = new Logger('Gateway Bootstrap');

  const app = await NestFactory.create(GatewayModule);

  app.enableShutdownHooks();

  const port = Number(process.env.GATEWAY_PORT ?? 3000);

  await app.listen(port);

  logger.log(`Gateway running at port ${port}`);
}
await bootstrap();
