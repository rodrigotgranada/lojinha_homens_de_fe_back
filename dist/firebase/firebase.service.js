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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var FirebaseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const admin = __importStar(require("firebase-admin"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let FirebaseService = FirebaseService_1 = class FirebaseService {
    configService;
    logger = new common_1.Logger(FirebaseService_1.name);
    firebaseApp = null;
    useLocalFallback = true;
    uploadDir = path.join(process.cwd(), "public", "uploads");
    constructor(configService) {
        this.configService = configService;
    }
    onModuleInit() {
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
        const bucket = this.configService.get("FIREBASE_STORAGE_BUCKET") || "lojinha-fe.firebasestorage.app";
        try {
            const files = fs.readdirSync(process.cwd());
            const serviceAccountFile = files.find((f) => f.includes("firebase-adminsdk") && f.endsWith(".json"));
            if (serviceAccountFile) {
                const keyPath = path.join(process.cwd(), serviceAccountFile);
                const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));
                this.firebaseApp = admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                    storageBucket: bucket,
                });
                this.useLocalFallback = false;
                this.logger.log(`Firebase Admin initialized successfully using key file: ${serviceAccountFile}`);
                return;
            }
        }
        catch (err) {
            this.logger.error("Failed to initialize Firebase using key file, checking env...", err);
        }
        const projectId = this.configService.get("FIREBASE_PROJECT_ID");
        const privateKey = this.configService.get("FIREBASE_PRIVATE_KEY");
        const clientEmail = this.configService.get("FIREBASE_CLIENT_EMAIL");
        if (projectId && privateKey && clientEmail) {
            try {
                const formattedPrivateKey = privateKey.replace(/\\n/g, "\n");
                this.firebaseApp = admin.initializeApp({
                    credential: admin.credential.cert({
                        projectId,
                        privateKey: formattedPrivateKey,
                        clientEmail,
                    }),
                    storageBucket: bucket,
                });
                this.useLocalFallback = false;
                this.logger.log("Firebase Admin initialized successfully with storage support.");
            }
            catch (err) {
                this.logger.error("Failed to initialize Firebase Admin SDK. Falling back to local storage.", err);
            }
        }
        else {
            this.logger.warn("Firebase credentials missing in .env. Product images will be stored locally.");
        }
    }
    async uploadFile(file, pathPrefix = "products") {
        if (this.useLocalFallback) {
            const filename = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
            const filePath = path.join(this.uploadDir, filename);
            await fs.promises.writeFile(filePath, file.buffer);
            const port = this.configService.get("PORT") || 3001;
            return `http://localhost:${port}/uploads/${filename}`;
        }
        try {
            const defaultBucket = admin.storage().bucket();
            const cleanFilename = file.originalname.replace(/\s+/g, "-");
            const filename = `${pathPrefix}/${cleanFilename}`;
            const fileRef = defaultBucket.file(filename);
            await fileRef.save(file.buffer, {
                metadata: {
                    contentType: file.mimetype,
                },
            });
            await fileRef.makePublic();
            return fileRef.publicUrl();
        }
        catch (error) {
            this.logger.error("Firebase upload failed, attempting local fallback", error);
            const filename = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
            const filePath = path.join(this.uploadDir, filename);
            await fs.promises.writeFile(filePath, file.buffer);
            const port = this.configService.get("PORT") || 3001;
            return `http://localhost:${port}/uploads/${filename}`;
        }
    }
    async deleteFile(fileUrl) {
        if (this.useLocalFallback || fileUrl.includes("localhost")) {
            try {
                const parts = fileUrl.split("/uploads/");
                if (parts.length > 1) {
                    const filename = parts[1];
                    const filePath = path.join(this.uploadDir, filename);
                    if (fs.existsSync(filePath)) {
                        await fs.promises.unlink(filePath);
                        this.logger.log(`Deleted local file: ${filename}`);
                    }
                }
            }
            catch (err) {
                this.logger.error(`Failed to delete local file: ${fileUrl}`, err);
            }
            return;
        }
        try {
            const bucketName = this.configService.get("FIREBASE_STORAGE_BUCKET");
            const prefix = `https://storage.googleapis.com/${bucketName}/`;
            if (fileUrl.startsWith(prefix)) {
                const filename = fileUrl.replace(prefix, "");
                const defaultBucket = admin.storage().bucket();
                await defaultBucket.file(filename).delete();
                this.logger.log(`Deleted file from Firebase: ${filename}`);
            }
        }
        catch (error) {
            this.logger.error(`Failed to delete Firebase file: ${fileUrl}`, error);
        }
    }
    isConnected() {
        return !this.useLocalFallback;
    }
};
exports.FirebaseService = FirebaseService;
exports.FirebaseService = FirebaseService = FirebaseService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], FirebaseService);
//# sourceMappingURL=firebase.service.js.map