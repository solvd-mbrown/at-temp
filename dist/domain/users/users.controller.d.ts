import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersController {
    private readonly usersRepository;
    private readonly usersService;
    constructor(usersRepository: UsersRepository, usersService: UsersService);
    addNewUser(createUserDto: CreateUserDto): Promise<{
        status: string;
    }>;
}
