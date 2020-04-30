import {Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn} from "typeorm";
import { Users } from "./Users";

@Entity()
export class UserGroups {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    title: string

    @Column()
    privileges: string

    @Column()
    created: string

    @Column()
    updated: string

    @OneToOne(type => Users, user => user.user_group)
    @JoinColumn({ name: "id" })
    user: Users
}