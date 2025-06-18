import { Column, CreateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Entity } from '../../decorators';

@Entity({
  name: 'user_setting',
})
export class UserSetting {
  @PrimaryGeneratedColumn('uuid', { comment: '知识ID' })
  id: string;

  @Column({ type: 'varchar' })
  key: string;

  @Column({ type: 'json', nullable: true })
  value: string;

  @Column({ type: 'varchar' })
  user_id: string;

  @CreateDateColumn()
  create_date: Date;

  @UpdateDateColumn()
  update_date: Date;

  @DeleteDateColumn()
  delete_date: Date;
}
