import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Entity } from '../../decorators';
import { FileSystem } from './FileSystem';

@Entity({
  name: 'project',
})
export class Project {
  @PrimaryGeneratedColumn('uuid', {})
  id: string;

  @Column({ type: 'varchar', comment: `英文名` })
  project_name: string;

  @Column({ type: 'varchar', comment: `中文名` })
  project_name_en: string;

  @Column({ type: 'text', nullable: true })
  project_readme: string;

  @Column({ type: 'text', nullable: true })
  project_readme_en: string;

  @OneToMany(() => FileSystem, (it) => it.project, {
    createForeignKeyConstraints: false,
  })
  files: FileSystem[];

  @CreateDateColumn()
  create_date: Date;

  @UpdateDateColumn()
  update_date: Date;

  @DeleteDateColumn()
  delete_date: Date;
}
