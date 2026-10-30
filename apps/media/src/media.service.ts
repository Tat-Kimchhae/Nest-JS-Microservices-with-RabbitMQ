import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { v2 as cloudinary } from 'cloudinary';
import { isObjectIdOrHexString, Model } from 'mongoose';
import { rpcBadRequest, rpcInternal, rpcNotFound } from '@app/rpc';
import { Media, MediaDocument } from './media.schema.js';

@Injectable()
export class MediaService {
  constructor(
    @InjectModel(Media.name) private readonly mediaModel: Model<MediaDocument>,
  ) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadProductImage(input: {
    fileName: string;
    mimeType: string;
    base64: string;
    uploadByUserId: string;
  }) {
    if (!input.base64) rpcBadRequest('Image base64 data is required');
    if (!input.mimeType?.startsWith('image/')) {
      rpcBadRequest('Only image files are supported');
    }

    const buffer = Buffer.from(input.base64, 'base64');
    if (buffer.length === 0) rpcBadRequest('Image data is empty');

    const upload = new Promise<{
      secure_url: string;
      public_id: string;
    }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: 'nestjs-microservice/products', resource_type: 'image' },
          (error, result) => {
            if (error || !result) {
              reject(
                error ?? new Error('Cloudinary returned no upload result'),
              );
              return;
            }
            resolve(result);
          },
        )
        .end(buffer);
    });

    const uploaded = await upload.catch((error: unknown) =>
      rpcInternal(
        'Image upload failed',
        error instanceof Error ? error.message : String(error),
      ),
    );

    const media = await this.mediaModel.create({
      url: uploaded.secure_url,
      publicId: uploaded.public_id,
      uploadByUserId: input.uploadByUserId,
    });
    return {
      mediaId: String(media._id),
      url: media.url,
      publicId: media.publicId,
    };
  }

  async attachToProduct(input: { mediaId: string; productId: string }) {
    if (!isObjectIdOrHexString(input.mediaId))
      rpcBadRequest('Invalid media id');
    const media = await this.mediaModel
      .findByIdAndUpdate(
        input.mediaId,
        { productId: input.productId },
        { new: true },
      )
      .exec();
    if (!media) rpcNotFound('Media not found', { mediaId: input.mediaId });
    return media;
  }

  ping() {
    return {
      status: true,
      service: 'Media',
      now: new Date().toISOString(),
    };
  }
}
