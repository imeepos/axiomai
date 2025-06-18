import { CreateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Entity } from '../../decorators';

@Entity({
  name: 'file_system',
})
export class FileSystem {
  @PrimaryGeneratedColumn('uuid', {})
  id: string;

  @CreateDateColumn()
  create_date: Date;

  @UpdateDateColumn()
  update_date: Date;

  @DeleteDateColumn()
  delete_date: Date;
}
