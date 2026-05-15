import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from '@/auth/passport/jwt-auth.guard';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('revenue-by-month')
  getRevenueByMonth(@Query('year') year: string) {
    return this.statisticsService.getRevenueByMonth(+year);
  }

  @UseGuards(JwtAuthGuard)
  @Get('revenue-by-week')
  getRevenueByWeek(@Query('date') date: string) {
    return this.statisticsService.getRevenueByWeekByDate(date);
  }

  @UseGuards(JwtAuthGuard)
  @Get('export-revenue-by-month')
  exportRevenueByMonth(@Query('year') year: string, @Res() res: Response) {
    return this.statisticsService.exportRevenueByMonth(+year, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('export-revenue-detail')
  exportRevenueDetail(@Query('year') year: string, @Res() res: Response) {
    return this.statisticsService.exportRevenueByMonthDetail(+year, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('order-by-month')
  getOrderByMonth(@Query('year') year: string) {
    return this.statisticsService.getOrdersByMonth(+year);
  }

  @UseGuards(JwtAuthGuard)
  @Get('order-by-week')
  getOrderByWeek(@Query('date') date: string) {
    return this.statisticsService.getOrdersByWeekByDate(date);
  }

  @UseGuards(JwtAuthGuard)
  @Get('export-order-detail')
  exportOrderDetail(@Query('year') year: string, @Res() res: Response) {
    return this.statisticsService.exportOrdersByMonth(+year, res);
  }
}
