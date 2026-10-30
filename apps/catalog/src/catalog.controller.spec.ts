import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { CatalogService } from './catalog.service.js';
import { Product } from './product.schema.js';
import { ProductEventsPublisher } from './product-events.publisher.js';

describe('CatalogService', () => {
  it('returns catalog ping status', async () => {
    const module = await Test.createTestingModule({
      providers: [
        CatalogService,
        { provide: getModelToken(Product.name), useValue: {} },
        { provide: ProductEventsPublisher, useValue: {} },
      ],
    }).compile();

    expect(module.get(CatalogService).ping().service).toBe('Catalog');
  });
});
