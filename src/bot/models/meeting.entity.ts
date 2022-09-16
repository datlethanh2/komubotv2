import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

import { TABLE } from "../constants/table";

@Entity(TABLE.MEETING)
export class Meeting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "text", nullable: true })
  channelId: string;

  @Column({ type: "decimal", nullable: true })
  createdTimestamp: number;

  @Column({ type: "text", nullable: true })
  task: string;

  @Column({ type: "text", nullable: true })
  repeat: string;

  @Column({ nullable: true })
  cancel: boolean;

  @Column({ nullable: true })
  reminder: boolean;

  @Column({ nullable: true })
  repeatTime: string;
}
