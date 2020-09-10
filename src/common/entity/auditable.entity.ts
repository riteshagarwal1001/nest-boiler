import {
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Column,
    BaseEntity,
} from 'typeorm';

export class AuditableEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    modifiedAt: Date;

    @Column()
    createdByName: string;

    @Column()
    modifiedByName: string;

    @Column()
    createdById: number;

    @Column()
    modifiedById: number;
}
