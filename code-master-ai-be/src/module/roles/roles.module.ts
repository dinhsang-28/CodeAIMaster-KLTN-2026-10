import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from './entities/role.entity';

@Module({
   imports: [
      // Đây là dòng "ma thuật" để giải quyết lỗi UnknownDependenciesException
      MongooseModule.forFeature([
        { name: Role.name, schema: RoleSchema },
      ]),
      
    ],
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolesModule {}
