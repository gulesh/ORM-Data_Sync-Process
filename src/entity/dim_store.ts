import {Column, Entity, Index, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";

@Entity("dim_store")
export class dim_store {
    @Column()
    store_id: number;
    @PrimaryGeneratedColumn()
    store_key:number;
    @Column()
    @Index()
    city: string;
    @Column()
    @Index()
    country: string;
    @Column()
    last_update: Date;
}