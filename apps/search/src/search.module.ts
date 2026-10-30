import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { SearchController } from './search.controller.js';
import { SearchService } from './search.service.js';
import { SearchProduct, SearchProductSchema } from './search-product.schema.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI_SEARCH ?? ''),
    MongooseModule.forFeature([
      { name: SearchProduct.name, schema: SearchProductSchema },
    ]),
  ],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
