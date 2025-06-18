import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Entity } from '../../decorators';
import { Project } from './Project';
/**
 * 文件系统
 */
@Entity({
  name: 'file_system',
})
export class FileSystem {
  @PrimaryGeneratedColumn('uuid', {})
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', comment: `file or dir` })
  type: string;

  @Column({ type: 'text', nullable: true, comment: `文件内容` })
  content: string;

  @Column({ type: 'varchar', nullable: true })
  @Index()
  pid: string;

  @OneToMany(() => FileSystem, (it) => it.parent, {
    createForeignKeyConstraints: false,
  })
  children: FileSystem[];

  @ManyToOne(() => FileSystem, (it) => it.children, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'pid' })
  parent: FileSystem;

  @Column({ type: 'varchar', nullable: true })
  project_id: string;

  @ManyToOne(() => Project, (it) => it.files, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @CreateDateColumn()
  create_date: Date;

  @UpdateDateColumn()
  update_date: Date;

  @DeleteDateColumn()
  delete_date: Date;
}
