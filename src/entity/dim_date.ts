import {Column, Entity, Index, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";

@Entity("dim_date")
export class dim_date {
    @PrimaryColumn()
    date_key:number;
    @Column()
    date: Date;
    @Column()
    @Index()
    year: number;
    @Column()
    @Index()
    quarter: number;
    @Column()
    @Index()
    month: number;
    @Column()
    day_of_month: number;
    @Column()
    day_of_week: number;
    @Column()
    @Index()
    is_weekend: number;
}