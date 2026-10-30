import { Test } from '@nestjs/testing';
import { of } from 'rxjs';
import { GatewayController } from './gateway.controller.js';

describe('GatewayController', () => {
  it('reports the health of its service clients', async () => {
    const module = await Test.createTestingModule({
      controllers: [GatewayController],
      providers: [
        {
          provide: 'CATALOG_CLIENT',
          useValue: { send: () => of({ status: true }) },
        },
        {
          provide: 'MEDIA_CLIENT',
          useValue: { send: () => of({ status: true }) },
        },
        {
          provide: 'SEARCH_CLIENT',
          useValue: { send: () => of({ status: true }) },
        },
      ],
    }).compile();

    const controller = module.get(GatewayController);
    const result = await controller.health();

    expect(result.services.catalog.status).toBe(true);
    expect(result.services.media.status).toBe(true);
    expect(result.services.search.status).toBe(true);
  });
});
