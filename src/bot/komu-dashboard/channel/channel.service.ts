import { fetchAntFeed } from 'src/bot/utils/ant';
import { Injectable, Inject } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ChannelType, Client, PermissionsBitField, REST, Routes   } from "discord.js";
import { Channel } from "src/bot/models/channel.entity";
import { Paging } from "src/bot/utils/commonDto";
import { formatPaging } from "src/bot/utils/formatter";
import { GetNameChannelService } from "src/bot/utils/getFullNameChannel/getFullNameChannel.service";
import { Repository } from "typeorm";
import { getListChannel, getListChannelMember, PostRemoteMemberChannel, GetSearchMemberChannel } from "./dto/channel.dto";
import { channelListType } from "../constants/channelListType";

@Injectable()
export class ChannelService {
  constructor(
    private getNameChannelService: GetNameChannelService,
    @InjectRepository(Channel)
    private channelRepository: Repository<Channel>,
    @Inject('DiscordClient')
    private readonly client: Client,
  ) {
    this.client.login(process.env.TOKEN);
  }

  async findAll(query: getListChannel,client: Client) {
    const { name, type, page, size, sort } = query;
    const guild = this.client.guilds.cache.get(process.env.GUILD_ID_WITH_COMMANDS);
    let list: any[] = Array.from(guild.channels.cache.values());

    if (sort) {
      if (sort === "ASC") {
        list = list.sort((a: any, b: any) => a.name.localeCompare(b.name));
      }
      if (sort === "DESC") {
        list = list.sort((a: any, b: any) => b.name.localeCompare(a.name));
      }
    }

    if(name){
      const regex = new RegExp(name, 'i');
      list = list.filter(item => regex.test(item?.name));
    }

    if(type){
      if(type === "Category"){
        list = list.filter(item => item?.type === 4);
      }
      if(type === "Thread"){
        list = list.filter(item => item?.type >= 10 && item?.type <= 12);
      }
      if(type === "Channel"){
        list = list.filter(item => item?.type !== 4 && item?.type !== 10 && item?.type !== 11 && item?.type !== 12 );
      }
    }
    const startIndex = (Number(page) - 1) * Number(size);
    const endIndex = Number(startIndex) + Number(size);
    let listData: any[] =[];
    list.slice(startIndex, endIndex).forEach((item: any) => {
      const changeType = channelListType.filter(main => main.id === item?.type)
      listData.push({
        type: changeType[0].type,
        name: item?.name,
        id: item?.id
      })
    });
    const total = list?.length;
    return {
      content: listData,
      pageable: {
        total,
        page: Number(page),
        size: Number(size),
      },
    };
  }

  async getTypeChannel(list: any) {
    try {
      const promises = list.map(async (item) => {
        if (item.type == ChannelType.GuildPublicThread) {
          return {
            ...item,
            type: "GUILD_PUBLIC_THREAD",
          };
        } else if (item.type == ChannelType.GuildPrivateThread) {
          return { ...item, type: "GUILD_PRIVATE_THREAD" };
        } else if (item.type == ChannelType.GuildText) {
          return { ...item, type: "GUILD_TEXT" };
        } else if (item.type == ChannelType.DM) {
          return { ...item, type: "DM" };
        } else {
          return item;
        }
      });

      return await Promise.all(promises);
    } catch (error) {}
  }

  async getViewChannell(query: getListChannelMember) {
    const { id, searchId } = query;
    const guild: any = await this.client.guilds.fetch(process.env.GUILD_ID_WITH_COMMANDS);
    const channel: any = await guild.channels.fetch(id);
    let membersWithRoles: any[] = [];
    if(channel?.isThread()) {
      const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
      const membersWithAccess: any = await rest.get(Routes.threadMembers(id));
      if (membersWithAccess?.length > 0) {
        for (const member of membersWithAccess) {
          const memberId = await guild.members.fetch(String(member?.user_id));
          const memberRoles = await memberId.roles.cache.map(( role: any ) => role.name);
          membersWithRoles.push({
            id: memberId.id,
            username: memberId.user.username,
            avatar: memberId.user.avatar,
            roles: memberRoles,
          });
        };
      }
    } else {
      const memberGuild = await guild.members.fetch();
      const membersWithAccess = memberGuild.filter((member: any ) => {
        const permissions = channel.permissionsFor(member);
        return permissions && permissions.has(PermissionsBitField.Flags.ViewChannel);
      });    
      membersWithAccess.forEach((member: any) => {
        const memberRoles =  member.roles.cache.map((role: any) => role.name);
        membersWithRoles.push({
          id: member.user.id,
          username: member.user.username,
          avatar: member.user.avatar,
          roles: memberRoles,
        });
      });
    }
    return {
      list: searchId ? membersWithRoles.filter(item => item?.id === searchId) : membersWithRoles,
      total: membersWithRoles.length,
    }
  }

  async postRemoteMemberChannel(query: PostRemoteMemberChannel) {
    const { channelId, userId } = query;
    const guild = await this.client.guilds.fetch(process.env.GUILD_ID_WITH_COMMANDS);
    const channel: any = await guild.channels.fetch(channelId);
    const member =await guild.members.fetch(userId);
    if (member) {
      if (channel.isThread()) {
        await channel.members.remove(member.id);
      } else {
        channel.permissionOverwrites.edit(member.id, {
          SendMessages: false,
          ViewChannel: false,
        });
      }
    }
  }

  async getSearchMemberChannel(query: GetSearchMemberChannel) {
    const { name } = query;
    const guild = await this.client.guilds.fetch(process.env.GUILD_ID_WITH_COMMANDS);
    const member =await guild.members.fetch();
    const regex = new RegExp(name, 'i');
    const filteredMembers = member.filter(item => regex.test(item.user.username));
    let membersWithRoles: any[] = [];
    filteredMembers.forEach((member: any) => {
      const memberRoles =  member.roles.cache.map((role: any) => role.name);
      membersWithRoles.push({
        id: member.user.id,
        username: member.user.username,
        avatar: member.user.avatar,
        roles: memberRoles,
      });
    });
    return {
      list: membersWithRoles,
    }
  }

  async postAddMemberChannel(query: PostRemoteMemberChannel) {
    const { channelId, userId } = query;
    const guild = await this.client.guilds.fetch(process.env.GUILD_ID_WITH_COMMANDS);
    const channel: any = await guild.channels.fetch(channelId);
    const member =await guild.members.fetch(userId);
    if (member) {
      if (channel.isThread()) {
        await channel.members.add(member.id);
      } else {
        channel.permissionOverwrites.edit(member.id, {
          SendMessages: true,
          ViewChannel: true,
        });
      }
    }
  }
}
