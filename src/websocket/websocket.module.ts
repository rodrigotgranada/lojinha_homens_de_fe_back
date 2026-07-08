import { Module, Global } from "@nestjs/common";
import { WebsocketGateway } from "./websocket.gateway";

@Global() // Make it global so other modules can inject WebsocketGateway easily
@Module({
  providers: [WebsocketGateway],
  exports: [WebsocketGateway],
})
export class WebsocketModule {}
