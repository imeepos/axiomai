import { Column, CreateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Entity } from '../../decorators';
export interface UserMessageContent {
  type: string;
  sendTime: Date;
  [key: string]: any;
}
@Entity({
  name: 'user_message',
})
export class UserMessage {
  @PrimaryGeneratedColumn('uuid', { comment: '知识ID' })
  id: string;

  @Column({ type: 'varchar' })
  from_uid: string;

  @Column({ type: 'varchar' })
  to_uid: string;

  @Column({ type: 'json', nullable: true })
  content: UserMessageContent;

  @CreateDateColumn()
  create_date: Date;

  @UpdateDateColumn()
  update_date: Date;

  @DeleteDateColumn()
  delete_date: Date;
}
