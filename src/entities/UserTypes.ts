import {Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn} from "typeorm";
import { Users } from "./Users";

@Entity()
export class UserTypes {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    title: string

    @Column()
    scope: string

    @Column()
    created: string

    @Column()
    updated: string

    @OneToOne(type => Users, user => user.user_type)
    @JoinColumn({ name: "id" })
    user: Users
}