import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
export declare class WebsocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private logger;
    afterInit(server: Server): void;
    handleConnection(client: Socket, ...args: any[]): void;
    handleDisconnect(client: Socket): void;
    broadcastStockChange(productId: string, newStock: number): void;
    broadcastLogAdded(log: any): void;
    broadcastProductStatusChange(productId: string, active: boolean): void;
    broadcastProductChange(product: any): void;
}
