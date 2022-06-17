import { Injectable, Scope } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
  ) {}
  
  async create(usersProperties): Promise<any> {
    const result = await this.userRepository.addNewUser(usersProperties);
    return result;
  }

  findAll() {
    return `This action returns all user`;
  }

  async findOne(id: number) {
    const result = await this.userRepository.getUserEntity(id);
    return result;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const result = await this.userRepository.updateUserEntity(id, updateUserDto);
    return result;
  }

  async remove(id: number) {
    const result = await this.userRepository.deleteUser(id);
    return result;
  }
}
