import { OnApplicationBootstrap } from "@nestjs/common";
import { Connection } from "mongoose";
import { FirebaseService } from "./firebase/firebase.service";
export declare class AppModule implements OnApplicationBootstrap {
    private readonly connection;
    private readonly firebaseService;
    constructor(connection: Connection, firebaseService: FirebaseService);
    onApplicationBootstrap(): Promise<void>;
    private seedDatabase;
}
