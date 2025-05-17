import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { User } from "./schemas/user.schema";
import { UserService } from "./user.service";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string): Promise<User | null> {
    return this.userService.findOne(id);
  }

  @Put(":id")
  update(@Param("id") id: string, @Body() updateUserDto: Partial<CreateUserDto>): Promise<User | null> {
    return this.userService.update(id, updateUserDto);
  }

  @Put(":id/energy-patterns")
  updateEnergyPatterns(@Param("id") id: string, @Body() energyPatterns: any[]): Promise<User | null> {
    return this.userService.updateEnergyPatterns(id, energyPatterns);
  }

  @Delete(":id")
  remove(@Param("id") id: string): Promise<User | null> {
    return this.userService.remove(id);
  }
}
