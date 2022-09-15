import { DiscordModule } from "@discord-nestjs/core";
import { forwardRef, Module } from "@nestjs/common";
import { DiscoveryModule } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BotController } from "./bot.controller";
import { BotService } from "./bot.service";
import { ChecklistCommand } from "./commands/checklist.command";
import { CheckListController } from "./commands/Checklist/checklist.controller";
import { CheckListModule } from "./commands/Checklist/checklist.module";
import { CheckListService } from "./commands/Checklist/checklist.service";
import { CompantripCommand } from "./commands/Companytrip/companytrip.command";
import { CompanyModule } from "./commands/Companytrip/companytrip.module";

import { DailyCommand } from "./commands/daily.command";
import holidayCommand from "./commands/holiday/holiday.command";
import LeaveCommand from "./commands/leave.command";
import { OrderCommand } from "./commands/order.command";
import { BotGateway } from "./events/bot.gateway";
import { Daily } from "./models/daily.entity";
import { Holiday } from "./models/holiday.entity";
import { Leave } from "./models/leave.entity";
import { Order } from "./models/order.entity";
import { PlaySlashCommand } from "./slash-commands/play.slashcommand";
import { PlaylistSlashCommand } from "./slash-commands/playlist.slashcommand";
import { UntilService } from "./untils/until.service";


@Module({
  imports: [
    DiscordModule.forFeature(),
    DiscoveryModule,
    TypeOrmModule.forFeature([Daily, Order, Leave, Holiday]),
    forwardRef(() => CheckListModule),
    CompanyModule
  ],
  providers: [
    PlaySlashCommand,
    PlaylistSlashCommand,
    ChecklistCommand,
    CompantripCommand,
    BotGateway,
    DailyCommand,
    OrderCommand,
    holidayCommand,
    LeaveCommand,
    BotService,
    OrderService,
    UntilService
  ],
  controllers: [BotController],
})
export class BotModule {}
