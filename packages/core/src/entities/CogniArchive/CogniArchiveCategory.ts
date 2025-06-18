import { Column, CreateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Entity } from '../../decorators';

/**
 * 知识分类
 */
@Entity({
  name: 'cogni_archive_category',
})
export class CogniArchiveCategory {
  @PrimaryGeneratedColumn('uuid', { comment: '知识ID' })
  id: string;

  @Column({
    type: 'varchar',
  })
  category_title: string;

  @Column({
    type: 'varchar',
  })
  category_title_en: string;

  @CreateDateColumn()
  create_date: Date;

  @UpdateDateColumn()
  update_date: Date;

  @DeleteDateColumn()
  delete_date: Date;
}
