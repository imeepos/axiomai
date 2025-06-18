import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Entity } from '../../decorators';
import { CogniArchivePackage } from './CogniArchivePackage';

/**
 * 通过解析 ast
 */
@Entity({
  name: 'cogni_archive',
})
export class CogniArchive {
  @PrimaryGeneratedColumn('uuid', { comment: '知识ID' })
  id: string;

  @Column({ type: 'varchar', comment: `开发语言`, nullable: true })
  @Index()
  package_id: string;

  @ManyToOne(() => CogniArchivePackage, (it) => it.children, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'package_id' })
  package: CogniArchivePackage;

  @Column({ type: 'varchar', comment: `名称` })
  name: string;

  @Column({ type: 'text', nullable: true, comment: `代码片段` })
  content: string;

  @Column({ type: 'json', nullable: true })
  deps: { packageName: string; name: string }[];

  @CreateDateColumn()
  create_date: Date;

  @UpdateDateColumn()
  update_date: Date;

  @DeleteDateColumn()
  delete_date: Date;
}
