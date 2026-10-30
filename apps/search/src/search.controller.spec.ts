import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { SearchService } from './search.service.js';
import { SearchProduct } from './search-product.schema.js';

describe('SearchService', () => {
  it('returns search ping status', async () => {
    const module = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: getModelToken(SearchProduct.name), useValue: {} },
      ],
    }).compile();

    expect(module.get(SearchService).ping().service).toBe('Search');
  });
});
