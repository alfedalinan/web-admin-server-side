import {Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn} from "typeorm";
import { UserTypes } from "./UserTypes";

@Entity()
export class Users {

    @PrimaryGeneratedColumn()
    id: number
    
    @Column()
    user_type: number

    @Column()
    username: string  
    
    @Column()
    password: string
    
    @Column()    
    first_name: string
    
    @Column()
    last_name: string

    @Column()
    old_password: string
    
    @Column()
    email: string
    
    @Column()
    created: string

    @OneToOne(type => UserTypes, user_type => user_type.user)
    @JoinColumn({ name: "user_type"})
    access_type: UserTypes
}