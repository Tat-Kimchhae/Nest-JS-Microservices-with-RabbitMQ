import { Controller } from '@nestjs/common';
import { CatalogService } from './catalog.service.js';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @MessagePattern('service.ping')
  ping() {
    return this.catalogService.ping();
  }

  @MessagePattern('product.create')
  create(data: Parameters<CatalogService['create']>[0]) {
    return this.catalogService.create(data);
  }

  @MessagePattern('product.list')
  list() {
    return this.catalogService.list();
  }

  @MessagePattern('product.getById')
  getById(data: { id: string }) {
    return this.catalogService.getById(data.id);
  }
}
