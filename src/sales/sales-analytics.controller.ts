import { Controller, Get, Param } from "@nestjs/common";
import { SalesAnalyticsService } from "./sales-analytics.service";

@Controller("sales/analytics")
export class SalesAnalyticsController {
  constructor(private readonly analyticsService: SalesAnalyticsService) {}

  @Get("event/:eventId")
  async getEventAnalytics(@Param("eventId") eventId: string) {
    return this.analyticsService.getEventAnalytics(eventId);
  }
}
