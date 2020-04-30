import {Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn} from "typeorm";

@Entity()
export class UserDomains {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    domain: string

    @Column()
    created: string

    @Column()
    updated: string
}