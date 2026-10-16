import { Injectable } from '@nestjs/common';

@Injectable()
export class MediaService {
  ping() {
    return {
      status: true,
      service: 'Media',
      now: new Date().toISOString(),
    };
  }
}
