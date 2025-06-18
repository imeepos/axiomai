import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Entity } from '../../decorators';
import { CogniArchive } from './CogniArchive';

/**
 * 知识库
 */
@Entity({
  name: 'cogni_archive_package',
})
export class CogniArchivePackage {
  @PrimaryGeneratedColumn('uuid', { comment: '知识ID' })
  id: string;

  @Column({ type: 'varchar', comment: `开发语言` })
  language: string;

  @Column({ type: 'varchar', comment: `包名称` })
  package_name: string;

  @OneToMany(() => CogniArchive, (it) => it.package, {
    createForeignKeyConstraints: false,
  })
  children: CogniArchive[];

  @CreateDateColumn()
  create_date: Date;

  @UpdateDateColumn()
  update_date: Date;

  @DeleteDateColumn()
  delete_date: Date;
}
