import { InjectRepository } from "@nestjs/typeorm";
import { Message, EmbedBuilder } from "discord.js";
import { User } from "src/bot/models/user.entity";
import { KomubotrestService } from "src/bot/utils/komubotrest/komubotrest.service";
import { Repository } from "typeorm";
import { CommandLine, CommandLineClass } from "../../base/command.base";
import { ToggleActiveService } from "./toggleActive.service";

@CommandLine({
  name: "toggleactivation",
  description: "Toggle Activation",
  cat: 'komu',
})
export class ToggleActiveCommand implements CommandLineClass {
  constructor(
    @InjectRepository(User)
    private userData: Repository<User>,
    private toggleActiveService: ToggleActiveService, 
    private komubotrestService : KomubotrestService,
  ) {}
  messHelp =
    "```" +
    "*toggleactivation username" +
    "\n" +
    "*toggleactivation id" +
    "```";

  async execute(message: Message, args, client) {
    try {
      let authorId = args[0];
      let userId = args[0].slice(2, -1);
      const findUserId = await this.toggleActiveService.findAcc(
        userId,
        authorId
      );
      const allUsers = await this.userData.find();

      const correctUrers = allUsers.find(
        (item) => item.username === findUserId.username
      );

      if (findUserId === null)
        return message
          .reply({
            content: `${this.messHelp}`,
          })
          .catch((err) => {
            this.komubotrestService.sendErrorToDevTest(client, authorId, err);
          });
      if (!correctUrers.deactive) {
        message
          .reply({
            content: "Disable account successfully",
          })
          .catch((err) => {
            this.komubotrestService.sendErrorToDevTest(client, authorId, err);
          });

        await this.toggleActiveService.deactiveAcc(correctUrers.userId);
      } else {
        await this.toggleActiveService.ActiveAcc(correctUrers.userId);
        message
          .reply({
            content: "Enable account successfully",
          })
          .catch((err) => {
            this.komubotrestService.sendErrorToDevTest(client, authorId, err);
          });
      }
    } catch (error) {
      console.log(error);
    }
  }
}
