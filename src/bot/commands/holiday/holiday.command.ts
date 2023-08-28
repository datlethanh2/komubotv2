import { Message, Client } from "discord.js";
import { KomubotrestService } from "src/bot/utils/komubotrest/komubotrest.service";
import { CommandLine, CommandLineClass } from "../../base/command.base";
import { HolidayService } from "./holiday.service";

const messHelp = "```" + "*holiday register dd/MM/YYYY content" + "```";
@CommandLine({
  name: "holiday",
  description: "Holiday",
  cat: "komu",
})
export default class HolidayCommand implements CommandLineClass {
  constructor(
    private holidayService: HolidayService,
    private komubotrestService: KomubotrestService
  ) {}
  async execute(message: Message, args, client: Client) {
    try {
      const holidayData = this.holidayService;
      let authorId = message.author.id;
      if (!args[0] && !args[1] && !args[2]) {
        return message.channel.send(messHelp);
      }

      const dateTime = args.slice(1, 2).join(" ");
      const messageHoliday = args.slice(2).join(" ");
      if (
        !/^(((0[1-9]|[12]\d|3[01])\/(0[13578]|1[02])\/((19|[2-9]\d)\d{2}))|((0[1-9]|[12]\d|30)\/(0[13456789]|1[012])\/((19|[2-9]\d)\d{2}))|((0[1-9]|1\d|2[0-8])\/02\/((19|[2-9]\d)\d{2}))|(29\/02\/((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|(([1][26]|[2468][048]|[3579][26])00))))$/.test(
          dateTime
        )
      ) {
        return message.channel.send(messHelp);
      }

      await holidayData
        .addHoliday(dateTime, messageHoliday)
        .catch((err) => console.log(err));
      message.reply({ content: "`✅` holiday saved." }).catch((err) => {
        this.komubotrestService.sendErrorToDevTest(client, authorId, err);
      });
    } catch (err) {
      console.log(err);
    }
  }
}
