import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Logger } from "@nestjs/common";

@WebSocketGateway({
  cors: {
    origin: "*", // Adjust in production
  },
})
export class WebsocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger("WebsocketGateway");

  afterInit(server: Server) {
    this.logger.log("WebSocket Gateway Initialized");
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Helper method to emit events to all connected clients
  broadcastStockChange(productId: string, newStock: number) {
    this.server.emit("stock_changed", { productId, newStock });
  }

  broadcastLogAdded(log: any) {
    this.server.emit("log_added", log);
  }

  broadcastProductStatusChange(productId: string, active: boolean) {
    this.server.emit("product_status_changed", { productId, active });
  }

  broadcastProductChange(product: any) {
    this.server.emit("product_changed", product);
  }
}
