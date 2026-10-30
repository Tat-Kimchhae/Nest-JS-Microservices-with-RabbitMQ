import {
  Body,
  Controller,
  Get,
  Inject,
  InternalServerErrorException,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { mapRpcErrorToHttp } from '@app/rpc';
import { AdminOnly } from './auth/admin.decorator.js';
import { CurrentUser } from './auth/current-user.decorator.js';
import { Public } from './auth/public.decorator.js';
import type { UserContext } from './auth/auth.types.js';
import { CreateProductDto } from './gateway.dto.js';

@Controller()
export class GatewayController {
  constructor(
    @Inject('CATALOG_CLIENT') private readonly catalogClient: ClientProxy,
    @Inject('MEDIA_CLIENT') private readonly mediaClient: ClientProxy,
    @Inject('SEARCH_CLIENT') private readonly searchClient: ClientProxy,
  ) {}

  private async send<T>(
    client: ClientProxy,
    pattern: string,
    payload: unknown,
  ): Promise<T> {
    try {
      return await firstValueFrom(client.send<T>(pattern, payload));
    } catch (error) {
      throw mapRpcErrorToHttp(error);
    }
  }

  @Get('health')
  @Public()
  async health() {
    const ping = async (service: string, client: ClientProxy) => {
      try {
        return {
          status: true,
          service,
          result: await firstValueFrom(
            client.send('service.ping', { from: 'gateway' }),
          ),
        };
      } catch (error) {
        const mappedError = mapRpcErrorToHttp(error);
        return { status: false, service, error: mappedError.message };
      }
    };

    const [catalog, media, search] = await Promise.all([
      ping('catalog', this.catalogClient),
      ping('media', this.mediaClient),
      ping('search', this.searchClient),
    ]);

    return {
      gateway: {
        service: 'gateway',
        now: new Date().toISOString(),
      },
      services: {
        catalog,
        media,
        search,
      },
    };
  }

  @Post('products')
  @AdminOnly()
  @UseInterceptors(
    FileInterceptor('image', { limits: { fileSize: 5 * 1024 * 1024 } }),
  )
  async createProduct(
    @Body() body: CreateProductDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUser() user: UserContext,
  ) {
    let imageUrl: string | undefined;
    let mediaId: string | undefined;

    if (file) {
      const uploaded = await this.send<{
        url: string;
        mediaId: string;
      }>(this.mediaClient, 'media.uploadProductImage', {
        fileName: file.originalname,
        mimeType: file.mimetype,
        base64: file.buffer.toString('base64'),
        uploadByUserId: user.clerkUserId,
      });
      imageUrl = uploaded.url;
      mediaId = uploaded.mediaId;
    }

    const product = await this.send<{ _id?: string; id?: string }>(
      this.catalogClient,
      'product.create',
      {
        ...body,
        price: Number(body.price),
        status: body.status ?? 'DRAFT',
        imageUrl,
        createdByClerkUserId: user.clerkUserId,
      },
    );

    const productId = product._id ?? product.id;
    if (mediaId) {
      if (!productId) {
        throw new InternalServerErrorException(
          'Catalog response did not include a product id',
        );
      }
      await this.send(this.mediaClient, 'media.attachToProduct', {
        mediaId,
        productId,
      });
    }
    return product;
  }

  @Get('products')
  @Public()
  listProducts() {
    return this.send(this.catalogClient, 'product.list', {});
  }

  @Get('products/:id')
  @Public()
  getProduct(@Param('id') id: string) {
    return this.send(this.catalogClient, 'product.getById', { id });
  }

  @Get('search')
  @Public()
  async search(@Query('q') query = '', @Query('limit') limit?: string) {
    const q = query.trim();
    const results = await this.send<unknown[]>(
      this.searchClient,
      'search.query',
      { q, limit: limit === undefined ? undefined : Number(limit) },
    );
    return { q, count: results.length, results };
  }
}
