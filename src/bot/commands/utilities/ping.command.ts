import { Client, EmbedBuilder, Message } from "discord.js";
import { CommandLine, CommandLineClass } from "src/bot/base/command.base";

@CommandLine({
  name: "ping",
  description: "Renvoie la latence du bot",
  cat: "utilities",
})
export class PingCommand implements CommandLineClass {
  async execute(message: Message, args, client: Client, guildDB) {
    message.channel
      .send("<a:green_loading:824308769713815612> **Pinging...**")
      .then(async (m) => {
        await m.edit({
          embeds: [
            {
              author: {
                name: `${message.member.user.tag}`,
                icon_url: message.member.user.displayAvatarURL({
                  // dynamic: true,
                  size: 512,
                }),
              },
              description: `**${
                guildDB.lang === "fr" ? "Ping du message" : "Message ping"
              }**: \`${Date.now() - m.createdTimestamp - 39}ms\`\n**${
                guildDB.lang === "fr" ? "Latence de discord" : "Discord latency"
              }**: \`${message.client.ws.ping}ms\`\n**${
                guildDB.lang === "fr" ? "Ping de la bdd" : "Database ping"
              }**: \`8ms\``,
              // color: guildDB.color,
              title: `${
                guildDB.lang === "fr" ? "Latence du bot" : "Bot latency"
              }`,
              footer: {
                text: `KOMU`,
                icon_url: message.client.user.displayAvatarURL({
                  // dynamic: true,
                  size: 512,
                }),
              },
            },
          ],
          content: null,
        });
      });
  }
}
