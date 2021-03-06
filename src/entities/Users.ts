import {Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn} from "typeorm";
import { UserGroups } from "./UserGroups";

@Entity()
export class Users {

    @PrimaryGeneratedColumn()
    id: number
    
    @Column()
    user_group: number

    @Column()
    username: string  
    
    @Column()
    password: string
    
    @Column()    
    first_name: string
    
    @Column()
    last_name: string

    @Column()
    token: string
    
    @Column()
    email: string
    
    @Column()
    created: string

    @Column()
    domain_group: string

    @OneToOne(type => UserGroups, user_group => user_group.user)
    @JoinColumn({ name: "user_group"})
    user_groups: UserGroups
}