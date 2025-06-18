import { Column, CreateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Entity } from '../decorators';

@Entity({ name: 'ai_role' })
export class AiRole {
  @PrimaryGeneratedColumn('uuid', {})
  id: string;

  @Column({
    type: 'varchar',
  })
  name: string;

  @Column({
    type: 'varchar',
  })
  description: string;

  @Column({ type: 'jsonb' })
  prompts: any;

  @CreateDateColumn()
  create_date: Date;

  @UpdateDateColumn()
  update_date: Date;

  @DeleteDateColumn()
  delete_date: Date;
}
