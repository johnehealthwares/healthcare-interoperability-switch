import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModulesModule } from './modules';
import { CommonModule } from './common';
import {
  ApplicationEntityEntity,
  RoutingTableEntity,
  StandardMappingEntity,
  MessageEventEntity,
  EventStreamEntity,
  ValidationRuleEntity,
} from './modules/core/entities';
import { AppController } from './app.controller';
import path from 'node:path';



console.log('DB PATH:', path.resolve('db.sqlite'));
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbType = configService.get<string>('DB_TYPE', 'sqlite');
        if (dbType === 'sqlite') {
          return {
            type: 'sqlite',
            database: 'db.sqlite',
            entities: [
              ApplicationEntityEntity,
              RoutingTableEntity,
              StandardMappingEntity,
              MessageEventEntity,
              EventStreamEntity,
              ValidationRuleEntity,
            ],
            synchronize: true,
            logging: configService.get<string>('DB_LOGGING') === 'true',
          };
        } else {
          return {
            type: 'postgres',
            host: configService.get<string>('DB_HOST', 'localhost'),
            port: configService.get<number>('DB_PORT', 5432),
            username: configService.get<string>('DB_USER', 'postgres'),
            password: configService.get<string>('DB_PASSWORD', 'postgres'),
            database: configService.get<string>('DB_NAME', 'health_interop_db'),
            entities: [
              ApplicationEntityEntity,
              RoutingTableEntity,
              StandardMappingEntity,
              MessageEventEntity,
              EventStreamEntity,
              ValidationRuleEntity,
            ],
            synchronize: configService.get<string>('NODE_ENV') !== 'production',
            logging: configService.get<string>('DB_LOGGING') === 'true',
          };
        }
      },
      inject: [ConfigService],
    }),
    ModulesModule,
    CommonModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
