import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private firebaseApp: admin.app.App | null = null;
  private useLocalFallback = true;
  private readonly uploadDir = path.join(process.cwd(), "public", "uploads");

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    // Ensure fallback directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }

    const bucket = this.configService.get<string>("FIREBASE_STORAGE_BUCKET") || "lojinha-fe.firebasestorage.app";

    // Auto-discover Firebase service account JSON key file
    try {
      const files = fs.readdirSync(process.cwd());
      const serviceAccountFile = files.find(
        (f) => f.includes("firebase-adminsdk") && f.endsWith(".json")
      );

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
    } catch (err) {
      this.logger.error("Failed to initialize Firebase using key file, checking env...", err);
    }

    const projectId = this.configService.get<string>("FIREBASE_PROJECT_ID");
    const privateKey = this.configService.get<string>("FIREBASE_PRIVATE_KEY");
    const clientEmail = this.configService.get<string>("FIREBASE_CLIENT_EMAIL");

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
      } catch (err) {
        this.logger.error("Failed to initialize Firebase Admin SDK. Falling back to local storage.", err);
      }
    } else {
      this.logger.warn("Firebase credentials missing in .env. Product images will be stored locally.");
    }
  }

  async uploadFile(file: Express.Multer.File, pathPrefix = "products"): Promise<string> {
    if (this.useLocalFallback) {
      const filename = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
      const filePath = path.join(this.uploadDir, filename);
      
      // Save file locally
      await fs.promises.writeFile(filePath, file.buffer);
      
      // Return local URL (assumes port 3001 serving static folder "public")
      const port = this.configService.get<number>("PORT") || 3001;
      return `http://localhost:${port}/uploads/${filename}`;
    }

    // Real Firebase Upload
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

      // Get public URL
      await fileRef.makePublic();
      return fileRef.publicUrl();
    } catch (error) {
      this.logger.error("Firebase upload failed, attempting local fallback", error);
      // Last-resort fallback to local file
      const filename = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
      const filePath = path.join(this.uploadDir, filename);
      await fs.promises.writeFile(filePath, file.buffer);
      const port = this.configService.get<number>("PORT") || 3001;
      return `http://localhost:${port}/uploads/${filename}`;
    }
  }

  async deleteFile(fileUrl: string): Promise<void> {
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
      } catch (err) {
        this.logger.error(`Failed to delete local file: ${fileUrl}`, err);
      }
      return;
    }

    // Real Firebase delete
    try {
      // Extract filename path from URL
      // Firebase public URLs have format: https://storage.googleapis.com/<bucket>/products/<name>
      const bucketName = this.configService.get<string>("FIREBASE_STORAGE_BUCKET");
      const prefix = `https://storage.googleapis.com/${bucketName}/`;
      if (fileUrl.startsWith(prefix)) {
        const filename = fileUrl.replace(prefix, "");
        const defaultBucket = admin.storage().bucket();
        await defaultBucket.file(filename).delete();
        this.logger.log(`Deleted file from Firebase: ${filename}`);
      }
    } catch (error) {
      this.logger.error(`Failed to delete Firebase file: ${fileUrl}`, error);
    }
  }

  isConnected(): boolean {
    return !this.useLocalFallback;
  }
}
