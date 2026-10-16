import { Injectable } from '@nestjs/common';

@Injectable()
export class CatalogService {
  ping() {
    return {
      status: true,
      service: 'Catalog',
      now: new Date().toISOString(),
    };
  }
}
