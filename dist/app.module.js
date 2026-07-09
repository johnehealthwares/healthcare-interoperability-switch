"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const modules_1 = require("./modules");
const common_2 = require("./common");
const entities_1 = require("./modules/core/entities");
const app_controller_1 = require("./app.controller");
const node_path_1 = __importDefault(require("node:path"));
console.log('DB PATH:', node_path_1.default.resolve('db.sqlite'));
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => {
                    const dbType = configService.get('DB_TYPE', 'sqlite');
                    if (dbType === 'sqlite') {
                        return {
                            type: 'sqlite',
                            database: 'db.sqlite',
                            entities: [
                                entities_1.ApplicationEntityEntity,
                                entities_1.RoutingTableEntity,
                                entities_1.StandardMappingEntity,
                                entities_1.MessageEventEntity,
                                entities_1.EventStreamEntity,
                                entities_1.ValidationRuleEntity,
                            ],
                            synchronize: true,
                            logging: configService.get('DB_LOGGING') === 'true',
                        };
                    }
                    else {
                        return {
                            type: 'postgres',
                            host: configService.get('DB_HOST', 'localhost'),
                            port: configService.get('DB_PORT', 5432),
                            username: configService.get('DB_USER', 'postgres'),
                            password: configService.get('DB_PASSWORD', 'postgres'),
                            database: configService.get('DB_NAME', 'health_interop_db'),
                            entities: [
                                entities_1.ApplicationEntityEntity,
                                entities_1.RoutingTableEntity,
                                entities_1.StandardMappingEntity,
                                entities_1.MessageEventEntity,
                                entities_1.EventStreamEntity,
                                entities_1.ValidationRuleEntity,
                            ],
                            synchronize: configService.get('NODE_ENV') !== 'production',
                            logging: configService.get('DB_LOGGING') === 'true',
                        };
                    }
                },
                inject: [config_1.ConfigService],
            }),
            modules_1.ModulesModule,
            common_2.CommonModule,
        ],
        controllers: [app_controller_1.AppController],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map