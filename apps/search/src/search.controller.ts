import { Controller } from '@nestjs/common';
import { SearchService } from './search.service.js';
import { EventPattern, MessagePattern } from '@nestjs/microservices';

@Controller()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @MessagePattern('service.ping')
  ping() {
    return this.searchService.ping();
  }

  @EventPattern('product.created')
  productCreated(data: Parameters<SearchService['indexProduct']>[0]) {
    return this.searchService.indexProduct(data);
  }

  @MessagePattern('search.query')
  query(data: { q?: string; limit?: number }) {
    return this.searchService.query(data);
  }
}
