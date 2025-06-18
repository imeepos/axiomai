import { PrimaryGeneratedColumn } from 'typeorm';
import { Entity } from '../../decorators';

/**
 * 知识库
 */
@Entity({
  name: 'cogni_archive',
})
export class CogniArchive {
  @PrimaryGeneratedColumn('uuid', { comment: '知识ID' })
  id: string;
}
