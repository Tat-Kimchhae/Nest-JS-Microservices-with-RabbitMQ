import { Controller } from '@nestjs/common';
import { MediaService } from './media.service.js';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @MessagePattern('service.ping')
  ping() {
    return this.mediaService.ping();
  }

  @MessagePattern('media.uploadProductImage')
  uploadProductImage(data: Parameters<MediaService['uploadProductImage']>[0]) {
    return this.mediaService.uploadProductImage(data);
  }

  @MessagePattern('media.attachToProduct')
  attachToProduct(data: { mediaId: string; productId: string }) {
    return this.mediaService.attachToProduct(data);
  }
}
