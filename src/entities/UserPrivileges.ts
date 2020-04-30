import {Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class UserPrivileges {
    
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    user_privilege: string

}