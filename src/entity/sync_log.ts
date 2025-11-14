import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("sync_log")
export class sync_log {
    @PrimaryGeneratedColumn()
    source_target_key: number;

    @Column({ type: "datetime" })
    sync_date: Date;

    @Column({ type: "varchar", length: 100 })
    source_table_name: string;

    @Column({ type: "varchar", length: 100 })
    target_table_name: string;

    @Column({ type: "int", nullable: true })
    source_records_count: number | null;

    @Column({ type: "int", nullable: true })
    target_records_count: number | null;

    @Column({ type: "int", nullable: true })
    records_difference: number | null;

    @Column({ type: "varchar", length: 20, default: "success" })
    sync_status: string;
}
