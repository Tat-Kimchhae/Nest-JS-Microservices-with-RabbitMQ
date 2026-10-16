import { Controller, Get, Inject } from '@nestjs/common';
import { GatewayService } from './gateway.service.js';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, from } from 'rxjs';

@Controller()
export class GatewayController {
  constructor(
    @Inject('CATALOG_SERVICE') private readonly catalogClient: ClientProxy,
    @Inject('MEDIA_SERVICE') private readonly mediaClient: ClientProxy,
    @Inject('SEARCH_SERVICE') private readonly searchClient: ClientProxy,
  ) {}

  @Get('health')
  async health() {
    const ping = async (serviceName: string, client: ClientProxy) => {
      try {
        const result = await firstValueFrom(
          client.send('service.ping', { from: 'gateway' }),
        );

        return {
          status: true,
          service: serviceName,
          result,
        };
      } catch (err: any) {
        return {
          status: false,
          service: serviceName,
          error: err?.message ?? 'Something went wrong!',
        };
      }
    };

    const [catalog, media, search] = await Promise.all([
      ping('catalog', this.catalogClient),
      ping('media', this.mediaClient),
      ping('search', this.searchClient),
    ]);

    return {
      gateway: {
        service: 'gateway',
        now: new Date().toISOString(),
      },
      services: {
        catalog,
        media,
        search,
      },
    };
  }
}
