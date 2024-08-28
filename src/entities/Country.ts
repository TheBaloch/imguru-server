import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Tag } from "./Tag";
import { CountryTranslations } from "./CountryTranslations";

@Entity()
export class Country {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true, type: "varchar" })
  slug!: string;

  @Column({ type: "varchar" })
  name!: string;

  @Column({ type: "varchar" })
  mainImage!: string;

  @Column({ type: "varchar" })
  flagImage!: string;

  @Column({ type: "varchar" })
  passportImage!: string;

  @Column({ type: "varchar", length: 2 })
  isoAlpha2Code!: string;

  @Column({ type: "varchar", length: 3 })
  isoAlpha3Code!: string;

  @Column({ type: "varchar" })
  isoNumericCode!: string;

  @Column({ type: "varchar" })
  currency!: string;

  @Column({ type: "varchar" })
  areaKm2!: String;

  @Column({ type: "varchar" })
  timeZone!: string;

  @Column({ type: "varchar" })
  callingCode!: string;

  @Column({ type: "varchar" })
  internetTLD!: string;

  @Column({ type: "varchar" })
  governmentType!: string;

  @Column({ type: "varchar" })
  independenceDay!: string;

  @Column({ type: "varchar" })
  drivingSide!: string;

  @OneToMany(
    () => CountryTranslations,
    (countrytranslation) => countrytranslation.country,
    {
      cascade: true,
      onDelete: "CASCADE",
    }
  )
  translations!: CountryTranslations[];

  @ManyToMany(() => Tag, (tag) => tag.country, { cascade: true })
  @JoinTable()
  tags!: Tag[];

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;
}
