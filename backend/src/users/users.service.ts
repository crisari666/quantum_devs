import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email: email.toLowerCase().trim() })
      .select('+passwordHash');
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(new Types.ObjectId(id));
  }

  async ensureSeedUser(email: string, plainPassword: string): Promise<void> {
    const normalized = email.toLowerCase().trim();
    const existing = await this.userModel.findOne({ email: normalized });
    if (existing) {
      return;
    }
    const passwordHash = await bcrypt.hash(plainPassword, 10);
    await this.userModel.create({ email: normalized, passwordHash });
  }
}
