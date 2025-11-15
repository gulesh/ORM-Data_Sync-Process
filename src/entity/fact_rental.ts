import {Column, Entity, Index, PrimaryGeneratedColumn} from "typeorm";

@Entity("fact_rental")
export class fact_rental {
    @Column()
    rental_id: number;
    @PrimaryGeneratedColumn()
    fact_rental_key:number;
    @Column({nullable: true})
    date_key_return: number;
    @Column({nullable: true})
    date_key_rented: number;
    @Column()
    @Index()
    film_key: number;
    @Column()
    @Index()
    store_key: number;
    @Column()
    @Index()
    customer_key: number;
    @Column()
    staff_id: number;
    @Column({nullable: true})
    @Index()
    rental_duration_days: number;
}