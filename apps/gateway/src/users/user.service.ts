import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './user.schema.js';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async upsertAuthUser(input: {
    clerkUserId: string;
    email: string;
    name: string;
  }) {
    return this.userModel.findOneAndUpdate(
      {
        clerkUserId: input.clerkUserId,
      },
      {
        $set: {
          email: input.email,
          name: input.name,
        },
        $setOnInsert: {
          role: 'user',
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );
  }

  async findByClerkUserId(clerkUserId: string) {
    return this.userModel.findOne({ clerkUserId });
  }
}
