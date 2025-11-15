import {Column, Entity, Index, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";

@Entity("fact_payment")
export class fact_payment {
    @Column()
    payment_id: number;
    @PrimaryGeneratedColumn()
    fact_payment_key:number;
    @Column()
    @Index()
    date_key_paid: number;
    @Column()
    @Index()
    store_key: number;
    @Column()
    @Index()
    customer_key: number;
    @Column()
    @Index()
    staff_id: number;
    @Column()
    amount: number;
}