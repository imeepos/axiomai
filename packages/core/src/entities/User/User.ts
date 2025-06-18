import { Column, CreateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Entity } from '../../decorators';

@Entity({
  name: `user`,
})
export class User {
  @PrimaryGeneratedColumn('uuid', { comment: '知识ID' })
  id: string;

  @Column({ type: 'varchar' })
  username: string;

  @Column({ type: 'varchar' })
  salt: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'int', default: 0, comment: `积分` })
  credit: number;

  @CreateDateColumn()
  create_date: Date;

  @UpdateDateColumn()
  update_date: Date;

  @DeleteDateColumn()
  delete_date: Date;
}
