import { CreateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Entity } from '../../decorators';
/**
 * 知识库版本
 */
@Entity({
  name: 'cogni_archive_version',
})
export class CogniArchiveVersion {
  @PrimaryGeneratedColumn('uuid', { comment: '知识ID' })
  id: string;

  @CreateDateColumn()
  create_date: Date;

  @UpdateDateColumn()
  update_date: Date;

  @DeleteDateColumn()
  delete_date: Date;
}
