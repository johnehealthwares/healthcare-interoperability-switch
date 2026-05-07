"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AERegistryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AERegistryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto_1 = require("crypto");
const entities_1 = require("../../core/entities");
const enums_1 = require("../../../common/enums");
let AERegistryService = AERegistryService_1 = class AERegistryService {
    constructor(aeRepository) {
        this.aeRepository = aeRepository;
        this.logger = new common_1.Logger(AERegistryService_1.name);
    }
    async registerAE(aeContract) {
        const id = (0, crypto_1.randomUUID)();
        const ae = this.aeRepository.create({
            id,
            ...aeContract,
        });
        const saved = await this.aeRepository.save(ae);
        this.logger.log(`AE registered: ${saved.id} (${saved.name})`);
        return saved;
    }
    async getAE(id) {
        return this.aeRepository.findOne({ where: { id } });
    }
    async getAEByName(name) {
        return this.aeRepository.findOne({ where: { name } });
    }
    async listAEs(filters) {
        const query = this.aeRepository.createQueryBuilder('ae');
        if (filters?.status) {
            query.andWhere('ae.status = :status', { status: filters.status });
        }
        if (filters?.facilityCode) {
            query.andWhere('ae.facilityCode = :facilityCode', {
                facilityCode: filters.facilityCode,
            });
        }
        return query.getMany();
    }
    async updateAE(id, updates) {
        await this.aeRepository.update(id, updates);
        const updated = await this.getAE(id);
        this.logger.log(`AE updated: ${id}`);
        return updated;
    }
    async deactivateAE(id) {
        await this.updateAE(id, { status: enums_1.AEStatus.INACTIVE });
        this.logger.log(`AE deactivated: ${id}`);
    }
    async deleteAE(id) {
        await this.aeRepository.softDelete(id);
        this.logger.log(`AE deleted: ${id}`);
    }
    async getAEsByProtocol(protocol, direction) {
        const query = this.aeRepository.createQueryBuilder('ae');
        if (direction === 'inbound') {
            query.where(':protocol = ANY(ae.inboundCapabilities)', {
                protocol,
            });
        }
        else {
            query.where(':protocol = ANY(ae.outboundCapabilities)', {
                protocol,
            });
        }
        return query.getMany();
    }
    async validateAEAccess(aeId, protocol, direction) {
        const ae = await this.getAE(aeId);
        if (!ae || ae.status !== enums_1.AEStatus.ACTIVE) {
            return false;
        }
        if (direction === 'inbound') {
            return ae.inboundCapabilities.includes(protocol);
        }
        else {
            return ae.outboundCapabilities.includes(protocol);
        }
    }
};
exports.AERegistryService = AERegistryService;
exports.AERegistryService = AERegistryService = AERegistryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.ApplicationEntityEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AERegistryService);
//# sourceMappingURL=ae-registry.service.js.map