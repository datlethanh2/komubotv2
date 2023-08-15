import { HttpService } from "@nestjs/axios";
import axios from "axios";
import { Client, EmbedBuilder, Message } from "discord.js";
import { firstValueFrom } from "rxjs";
import { CommandLine, CommandLineClass } from "src/bot/base/command.base";
import { KomubotrestService } from "src/bot/utils/komubotrest/komubotrest.service";
import { HeyboyService } from "./heyboy.service";
import { ClientConfigService } from "src/bot/config/client-config.service";

@CommandLine({
  name: "chuc",
  description: "create a poll",
  cat: "komu",
})
export class HeyboyCommand implements CommandLineClass {
  constructor(
    private heyboyService: HeyboyService,
    private configService: ClientConfigService,
    private readonly http: HttpService,
    private komubotrestService: KomubotrestService
  ) {}
  getUserNameByEmail(string) {
    if (string.includes("@ncc.asia")) {
      return string.slice(0, string.length - 9);
    }
  }
  private Embed = new EmbedBuilder()
    .setTitle("Hey Boy 💋")
    .setDescription(
      "Hôm nay mồng 8 tháng 3" +
        "\n" +
        "Các anh đừng quên mua ngay món quà" +
        "\n" +
        "Tặng mẹ tặng vợ liền tay" +
        "\n" +
        "Tặng cả đồng nghiệp hay hay team mình." +
        "\n" +
        "Xin mời các anh zai em zai hãy mua ngay tà tưa để tặng hội chị em NCC LIỀN" +
        "\n" +
        "NGAY VÀ LẬP TỨC"
    )
    .setColor(0xed4245)
    .setImage(
      "https://media.discordapp.net/attachments/921593472039915551/950589987093618779/17f8c1fe0da2bc7bffc9b62817d9143fdau-nam-tha-tim-yeu-lam.png"
    );
  private EmbedWomenDay = new EmbedBuilder()
    .setTitle("Happy Women's Day 💋")
    .setDescription(
      "Sắp đến mùng 8 tháng 3 \n Giá hoa thì đắt giá quà thì cao" +
        "\n" +
        "Tiền lương tiêu hết hồi nào" +
        "\n" +
        "Bonus thì lại chẳng trao dịp này" +
        "\n" +
        "Thôi thì có tấm thân gầy" +
        "\n" +
        "Nguyện trao gửi phận đến tay ai cần" +
        "\n" +
        "Cùng những lời chúc có vần" +
        "\n" +
        "Một trái tim nhỏ, ngàn lần yêu thương" +
        "\n" +
        "Chúc cho may mắn đủ đường" +
        "\n" +
        "Chị em đến tháng......lĩnh lương nhiều nhiều" +
        "\n" +
        "Ung dung chẳng nghĩ tiền tiêu" +
        "\n" +
        "Công việc thuận lợi mọi điều hanh thông" +
        "\n" +
        "Đến tuổi chúc sớm lấy chồng" +
        "\n" +
        "Gia đình hạnh phúc thành công mọi đường" +
        "\n" +
        "Chị em chưa có người thương" +
        "\n" +
        "Sớm có thằng rước thuận đường tình duyên" +
        "\n" +
        "Anh em phải nhớ không quên" +
        "\n" +
        "Chị em mãi đẹp nữ quyền lên ngôi." +
        "\n" +
        "*From NCC8 with Love*"
    )
    .setColor(0xed4245)
    .setFooter({
      text: "Mãi iu 💋",
    })
    .setImage(
      "https://media.discordapp.net/attachments/921593472039915551/950241681041670164/unknown.png"
    );
  async execute(message: Message, args, client: Client) {
    if (args[0] !== "mung" || args[1] !== "ngay" || args[2] !== "8/3") return;
    const ID_USER_PRIVATE = "869774806965420062";
    if (message.author.id !== ID_USER_PRIVATE) {
      return message.reply("Missing permissions");
    }
    await this.komubotrestService.sendMessageToNhaCuaChung(client, {
      embeds: [this.EmbedWomenDay],
    });
    await this.komubotrestService.sendMessageToNhaCuaChung(client, {
      embeds: [this.Embed],
    });
    const response = await firstValueFrom(
      this.http
        .get(
          `${this.configService.getAllUser.api_url}`
        )
        .pipe((res) => res)
    );
    if (!response.data || !response.data.result) {
      console.log("respon data error");
      return;
    }
    const emailsWoman = response.data.result
      .filter((user) => user.sex === 0)
      .map((item) => this.getUserNameByEmail(item.emailAddress));

    const userWoman = await this.heyboyService.findWomanUser(emailsWoman);
    await Promise.all(
      userWoman.map((user) =>
        this.komubotrestService.sendMessageKomuToUser(
          client,
          { embeds: [this.Embed] },
          user.email
        )
      )
    );
  }
}
