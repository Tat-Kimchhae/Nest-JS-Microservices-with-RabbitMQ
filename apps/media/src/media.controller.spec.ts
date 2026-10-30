import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { MediaService } from './media.service.js';
import { Media } from './media.schema.js';

describe('MediaService', () => {
  it('returns media ping status', async () => {
    const module = await Test.createTestingModule({
      providers: [
        MediaService,
        { provide: getModelToken(Media.name), useValue: {} },
      ],
    }).compile();

    expect(module.get(MediaService).ping().service).toBe('Media');
  });
});
