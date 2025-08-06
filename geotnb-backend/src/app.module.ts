import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { JournalAction } from './journal-action/entities/journal-action.entity';
import { User } from './user/entities/user.entity';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5433,
      username: 'postgres',
      password: '123456789',
      database: 'Application SIG_TNB',
      entities: [User, JournalAction], // Enregistrement des entités User et JournalAction
      synchronize: false,
    }),
    AuthModule,
    UserModule, // Assurez-vous que UserModule est bien importé
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
