import { Injectable } from '@nestjs/common';

@Injectable()
export class SearchService {
  ping() {
    return {
      status: true,
      service: 'Search',
      now: new Date().toISOString(),
    };
  }
}
