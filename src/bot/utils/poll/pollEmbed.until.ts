import { EmbedBuilder, Message } from "discord.js";
const defEmojiList = [
  "\u0031\u20E3",
  "\u0032\u20E3",
  "\u0033\u20E3",
  "\u0034\u20E3",
  "\u0035\u20E3",
  "\u0036\u20E3",
  "\u0037\u20E3",
  "\u0038\u20E3",
  "\u0039\u20E3",
  "\uD83D\uDD1F",
  ":regional_indicator_j:",
  ":regional_indicator_q:",
  ":regional_indicator_k:",
  ":regional_indicator_a:",
  ":pear:",
  ":crab:",
  ":fried_shrimp:",
  ":whale2:",
];

export class PollEmbedUntil {
  pollEmbed = async (
    msg: Message,
    title,
    options,
    timeout = 12,
    emojiList = defEmojiList.slice(),
    forceEndPollEmoji = "\u2705"
  ) => {
    if (!msg && !msg.channel) return msg.reply("Channel is inaccessible.");
    if (!title) return msg.reply("Poll title is not given.");
    if (!options) return msg.reply("Poll options are not given.");
    if (options.length < 2) {
      return msg.reply("Please provide more than one choice.");
    }
    if (options.length > emojiList.length) {
      return msg.reply(`Please provide ${emojiList.length} or less choices.`);
    }

    let text = `*To vote, react using the correspoding emoji.\nThe voting will end in **${timeout} hours**.\nPoll creater can end the poll **forcefully** by reacting to ${forceEndPollEmoji} emoji.*\n\n`;
    const emojiInfo: any = [];
    for (const option of options) {
      const emoji: any = emojiList.splice(0, 1);
      emojiInfo[emoji] = { option: option, votes: 0, username: [] };
      text += `${emoji} : \`${option}\`\n\n`;
    }

    const usedEmojis = Object.keys(emojiInfo);
    usedEmojis.push(forceEndPollEmoji);

    const poll = await msg.channel.send({
      embeds: [
        this.embedBuilder(title, msg.author.username).setDescription(text),
      ],
    });

    for (const emoji of usedEmojis) await poll.react(emoji);

    const reactionCollector = poll.createReactionCollector({
      filter: (reaction, user) =>
        usedEmojis.includes(reaction.emoji.name) && !user.bot,
      time: timeout === 0 ? undefined : timeout * 3600 * 1000,
    });
    const voterInfo = new Map();
    reactionCollector.on("collect", (reaction, user) => {

      if (usedEmojis.includes(reaction.emoji.name)) {
        if (
          reaction.emoji.name === forceEndPollEmoji &&
          msg.author.id === user.id
        ) {
          return reactionCollector.stop();
        }
        if (!voterInfo.has(user.id)) {
          voterInfo.set(user.id, { emoji: reaction.emoji.name });
        }
        const votedEmoji = voterInfo.get(user.id).emoji;
        if (votedEmoji !== reaction.emoji.name) {
          const lastVote = poll.reactions.cache.get(votedEmoji);
          lastVote.count -= 1;
          lastVote.users.remove(user.id);
          if (emojiInfo[votedEmoji] !== undefined) {
            emojiInfo[votedEmoji].votes -= 1;
            emojiInfo[votedEmoji].username = emojiInfo[
              votedEmoji
            ].username.filter((item) => item !== user.username);
          }
          voterInfo.set(user.id, { emoji: reaction.emoji.name });
        }
        if (emojiInfo[reaction.emoji.name] !== undefined) {
          emojiInfo[reaction.emoji.name].votes += 1;
          emojiInfo[reaction.emoji.name].username.push(user.username);
        }
      }
    });

    reactionCollector.on("dispose", (reaction, user) => {
      if (usedEmojis.includes(reaction.emoji.name)) {
        voterInfo.delete(user.id);
        emojiInfo[reaction.emoji.name].votes -= 1;
        emojiInfo[reaction.emoji.name].username = emojiInfo[
          reaction.emoji.name
        ].username.filter((item) => item !== user.username);
      }
    });

    reactionCollector.on("end", () => {
      text = "*Ding! Ding! Ding! Time's up!\n Results are in,*\n\n";
      for (const emoji in emojiInfo) {
        const vote = emojiInfo[emoji].username
          .map((item) => item)
          .filter((x, i, a) => a.indexOf(x) === i);
        text += `\`${emojiInfo[emoji].option}\` - \`${vote.length}\`\n\n`;
        vote.map((item) => {
          text += `\`+ ${item}\`\n\n`;
        });
      }
      poll.delete();
      msg.channel
        .send({
          embeds: [
            this.embedBuilder(title, msg.author.tag).setDescription(text),
          ],
        })
        .catch(console.error);
    });
  };

  embedBuilder = (title, author) => {
    return new EmbedBuilder()
      .setTitle(`Poll - ${title}`)
      .setFooter({ text: `Poll created by ${author}` });
  };
}
