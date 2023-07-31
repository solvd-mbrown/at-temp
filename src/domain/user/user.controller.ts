import {Body, Controller, Delete, Get, Param, Patch, Post,} from "@nestjs/common";
import {UserService} from "./user.service";
import {CreateUserDto} from "./dto/create-user.dto";
import {UpdateUserDto} from "./dto/update-user.dto";
import {ApiTags} from "@nestjs/swagger";

@ApiTags('user')
@Controller("user")
// @UseGuards(FirebaseAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("add")
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.userService.findOne(+id);
  }

  @Get("email/:email")
  findOneByEmail(@Param("email") email: string) {
    return this.userService.findOneByEmail(email);
  }

  @Get("initUser/:token")
  initUser(@Param("token") jwt: string) {
    return this.userService.initUser(jwt);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete("remove/:id")
  remove(@Param("id") id: string) {
    return this.userService.remove(+id);
  }
}
