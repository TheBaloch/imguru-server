import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Column,
  ManyToOne,
} from "typeorm";
import { Country } from "./Country";

@Entity()
export class Passport {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Country, (country) => country.passport)
  country!: Country;

  @Column({ type: "varchar" })
  language!: string;

  @Column({ type: "varchar", nullable: true })
  mainContent!: string;

  @Column({ type: "varchar", nullable: true })
  secondContent!: string;

  @Column({ type: "varchar", nullable: true })
  thirdContent!: string;

  @Column({ type: "json", nullable: true })
  visaFreeAccess!: any[];

  @Column({ type: "json", nullable: true })
  visaOnArrival!: any[];

  @Column({ type: "json", nullable: true })
  eTA!: any[];

  @Column({ type: "json", nullable: true })
  visaOnline!: any[];

  @Column({ type: "json", nullable: true })
  visaRequired!: any[];

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;
}
