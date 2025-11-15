import {Column, Entity, Index, OneToMany, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";
import {bridge_film_actor} from "./bridge_film_actor";

@Index(['first_name', 'last_name'])
@Entity("dim_actor")
export class dim_actor {
    @Column()
    actor_id: number;
    @PrimaryGeneratedColumn()
    actor_key:number;
    @Column()
    first_name: string;
    @Column()
    last_name: string;
    @Column()
    last_update: Date;

    @OneToMany(() => bridge_film_actor, bridge_film_actor => bridge_film_actor.dim_actor)
    bridge_film_actor: bridge_film_actor[];
}