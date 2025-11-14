import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity('sync_table')
export class sync_table {
    @PrimaryGeneratedColumn()
    sync_key:number;
    @Column()
    table_name: string;
    @Column()
    last_sync_time: Date;
}