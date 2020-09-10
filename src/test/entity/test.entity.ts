import { Entity, Column } from 'typeorm';
import { AuditableEntity } from '../../common/entity/auditable.entity';

@Entity()
export class Test extends AuditableEntity {
    @Column({ type: 'text' })
    name: string;
}
