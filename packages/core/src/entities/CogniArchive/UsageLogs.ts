import { CreateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Entity } from '../../decorators';

/**
 * 学习记录
 */
@Entity({
  name: 'cogni_archive_usage_logs',
})
export class UsageLogs {
  @PrimaryGeneratedColumn('uuid', { comment: '知识ID' })
  id: string;

  @CreateDateColumn()
  create_date: Date;

  @UpdateDateColumn()
  update_date: Date;

  @DeleteDateColumn()
  delete_date: Date;
}
