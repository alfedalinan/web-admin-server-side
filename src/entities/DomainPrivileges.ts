import {Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class DomainPrivileges {
    
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    domain_privilege: string


}