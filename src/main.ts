import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ValidationPipe, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as path from "path";
import * as dns from "dns";

async function bootstrap() {
  // Force Node.js to use Google and Cloudflare DNS to fix querySrv DNS issues on some ISPs
  dns.setServers(["8.8.8.8", "1.1.1.1"]);

  const logger = new Logger("Bootstrap");
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS for frontend compatibility
  app.enableCors({
    origin: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
  });

  // Enable validation pipes globally
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  // Serve the public folder statically (for uploads fallback)
  app.useStaticAssets(path.join(process.cwd(), "public"), {
    prefix: "/",
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>("PORT") || 3001;

  await app.listen(port, "0.0.0.0");
  logger.log(`NestJS Backend server is running on: http://0.0.0.0:${port} (LAN compatible)`);
}
bootstrap();
