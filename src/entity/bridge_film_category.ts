import {Entity, Index, JoinColumn, ManyToOne, PrimaryColumn} from "typeorm";
import {dim_film} from "./dim_film";
import {dim_category} from "./dim_category";

@Index(["film_key", "category_key"], { unique: true })
@Entity('bridge_film_category')
export class bridge_film_category {
    @PrimaryColumn()
    category_key: number;
    @PrimaryColumn()
    film_key: number;

    @ManyToOne(type => dim_film, dim_film => dim_film.bridge_film_category)
    @JoinColumn({ name: 'film_key' })
    dim_film: dim_film;

    @ManyToOne(type => dim_category, dim_category => dim_category.bridge_film_category)
    @JoinColumn({ name: 'category_key' })
    dim_category: dim_category;
}