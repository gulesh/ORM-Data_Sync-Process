import {Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn} from "typeorm";
import {dim_film} from "./dim_film";
import {dim_actor} from "./dim_actor";

@Index(["film_key", "actor_key"], { unique: true })
@Entity('bridge_film_actor')
export class bridge_film_actor {
    @PrimaryColumn()
    actor_key: number;
    @PrimaryColumn()
    film_key: number;

    @ManyToOne(type => dim_film, dim_film => dim_film.bridge_film_actor)
    @JoinColumn({ name: 'film_key' })
    dim_film: dim_film;

    @ManyToOne(type => dim_actor, dim_actor => dim_actor.bridge_film_actor)
    @JoinColumn({ name: 'actor_key' })
    dim_actor: dim_actor;

}