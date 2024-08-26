import { Controller, Get } from '@nestjs/common';
import { AdminProfileService } from './admin.service';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('Admin Operations')
@Controller('admin-profile')
export class AdminProfileController {

    constructor(
        private readonly adminServices: AdminProfileService,
    ){}

    @Get('/users')
    async allUsers() {
        const allUsers = await this.adminServices.countUsers()
        return allUsers;
    }

    @Get('/role/users')
    async userCount() {
        const userCount = await this.adminServices.countUsersByRole()
        return userCount;
    }
}
