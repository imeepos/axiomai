import { CreateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Entity } from '../../decorators';
/**
 * 知识库图谱
 */
@Entity({
  name: 'cogni_archive_knowledge_graph',
})
export class KnowledgeGraph {
  @PrimaryGeneratedColumn('uuid', { comment: '知识ID' })
  id: string;

  @CreateDateColumn()
  create_date: Date;

  @UpdateDateColumn()
  update_date: Date;

  @DeleteDateColumn()
  delete_date: Date;
}
