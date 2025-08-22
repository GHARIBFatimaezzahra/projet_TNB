import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

// Chargement des variables d'environnement
config();

const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.get('DB_HOST', 'localhost'),
  port: configService.get('DB_PORT', 5433),
  username: configService.get('DB_USERNAME', 'postgres'),
  password: configService.get('DB_PASSWORD', '123456789'),
  database: configService.get('DB_NAME', 'Application SIG_TNB'),
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
  synchronize: false, // Toujours false pour les migrations
  logging: configService.get('NODE_ENV') === 'development',
});

// Pour les commandes TypeORM CLI
export default AppDataSource;
