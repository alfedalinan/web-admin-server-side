import {Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn} from "typeorm";

@Entity()
export class DomainGroups {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    domain_group: string

    @Column()
    domain_privileges: string

}