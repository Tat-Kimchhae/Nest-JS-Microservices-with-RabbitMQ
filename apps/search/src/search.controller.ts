import { Controller, Get } from '@nestjs/common';
import { SearchService } from './search.service.js';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @MessagePattern('service.ping')
  ping() {
    return this.searchService.ping();
  }
}
