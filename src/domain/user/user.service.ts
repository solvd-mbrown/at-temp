import { Injectable } from "@nestjs/common";
import { FirebaseAuthStrategy } from "src/services/auth/firebase/firebase-auth.strategy";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "./entities/user.entity";
import { UserRepository } from "./user.repository";

@Injectable()
export class UserService {
  constructor(
    private readonly firebaseService: FirebaseAuthStrategy,
    private readonly userRepository: UserRepository
  ) {}

  async create(usersProperties): Promise<User> {
    return await this.userRepository.addNewUser(usersProperties);
  }

  findAll() {
    return `This action returns all user`;
  }

  async findOne(id: number): Promise<User> {
    return await this.userRepository.getUserEntity(id);

  }

  async findOneByEmail(email: string): Promise<User> {
    return await this.userRepository.getUserFromEmail(email);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    return await this.userRepository.updateUserEntity(
      id,
      updateUserDto
    );

  }

  async remove(id: number) {
    return await this.userRepository.deleteUser(id);

  }

  public async initUser(jwt: string) {
    const jwtParsed = await this.firebaseService.validate(jwt);
    return await this.userRepository.getUserFromEmail(jwtParsed.email);
  }
}
