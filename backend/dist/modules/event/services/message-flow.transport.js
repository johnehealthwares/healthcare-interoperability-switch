"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.postJson = postJson;
const http = __importStar(require("http"));
function postJson(url, body) {
    return new Promise((resolve, reject) => {
        try {
            const parsedUrl = new URL(url);
            const data = JSON.stringify(body);
            const options = {
                hostname: parsedUrl.hostname,
                port: Number(parsedUrl.port) ||
                    (parsedUrl.protocol === 'https:' ? 443 : 80),
                path: parsedUrl.pathname + parsedUrl.search,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(data),
                },
            };
            const request = http.request(options, (response) => {
                let responseBody = '';
                response.on('data', (chunk) => {
                    responseBody += chunk.toString();
                });
                response.on('end', () => {
                    try {
                        resolve(responseBody ? JSON.parse(responseBody) : null);
                    }
                    catch {
                        resolve(responseBody);
                    }
                });
            });
            request.on('error', reject);
            request.write(data);
            request.end();
        }
        catch (error) {
            reject(error);
        }
    });
}
//# sourceMappingURL=message-flow.transport.js.map