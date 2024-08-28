import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  CreateDateColumn,
  Index,
} from "typeorm";
import { Country } from "./Country";

@Entity()
@Index("idx_tag_slug", ["slug"])
export class Tag {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true, type: "varchar", length: 100 })
  name!: string;

  @Column({ unique: true, type: "varchar", length: 100 })
  slug!: string;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @ManyToMany(() => Country, (country) => country.tags)
  country!: Country[];
}
