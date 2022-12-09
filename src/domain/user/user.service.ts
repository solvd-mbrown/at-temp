import { Injectable } from "@nestjs/common";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserRepository } from "./user.repository";
import { FirebaseAuthStrategy } from "../../services/auth/firebase/firebase-auth.strategy";
import { generateTestUsers } from "./test/user.test.utils";
import { FileService } from "../file/file.service";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class UserService {
  constructor(
    private readonly fileService: FileService,
    private readonly firebaseService: FirebaseAuthStrategy,
    private readonly userRepository: UserRepository
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

  async findOneByEmail(email: string) {
    const result = await this.userRepository.getUserFromEmail(email);
    return result;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
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

  // ----dev-----
  public async test(file) {
    // const users = generateTestUsers(2);
    // const createdUsers = await Promise.all(users.map((u) => this.create(u)));
    // return createdUsers;
    // const email = "test0@gtest0.com";

    // return await this.fileService.upload(file, email);
    return this.fileService.findOne(1);
  }
}
