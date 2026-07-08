import { OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
export declare class FirebaseService implements OnModuleInit {
    private configService;
    private readonly logger;
    private firebaseApp;
    private useLocalFallback;
    private readonly uploadDir;
    constructor(configService: ConfigService);
    onModuleInit(): void;
    uploadFile(file: Express.Multer.File, pathPrefix?: string): Promise<string>;
    deleteFile(fileUrl: string): Promise<void>;
    isConnected(): boolean;
}
