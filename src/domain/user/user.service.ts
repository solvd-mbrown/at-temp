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
    const result = await this.userRepository.addNewUser(usersProperties);
    return result;
  }

  findAll() {
    return `This action returns all user`;
  }

  async findOne(id: number): Promise<User> {
    const result = await this.userRepository.getUserEntity(id);
    return result;
  }

  async findOneByEmail(email: string): Promise<User> {
    const result = await this.userRepository.getUserFromEmail(email);
    return result;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const result = await this.userRepository.updateUserEntity(
      id,
      updateUserDto
    );
    return result;
  }

  async remove(id: number) {
    const result = await this.userRepository.deleteUser(id);
    return result;
  }

  public async initUser(jwt: string) {
    const jwtParsed = await this.firebaseService.validate(jwt);
    const result = await this.userRepository.getUserFromEmail(jwtParsed.email);
    return result;
  }
}
