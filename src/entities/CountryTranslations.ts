import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Country } from "./Country";

@Entity()
export class CountryTranslations {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar" })
  language!: string; //en,es,de etc

  @Column({ type: "varchar" })
  name!: string;

  @Column({ type: "varchar", nullable: true })
  title!: string; //normal text

  @Column({ type: "varchar" })
  capitalCity!: string;

  @Column({ type: "varchar" })
  continent!: string;

  @Column({ type: "varchar", nullable: true })
  officialReligion!: string; //normal text

  @Column({ type: "varchar" })
  officialLanguage!: string;

  @Column({ type: "text", nullable: true })
  overview!: string; //normal text

  @Column({ type: "text", nullable: true })
  introduction!: string; //normal text

  @Column({ type: "text", nullable: true })
  climate!: string; //normal text

  @Column({ type: "varchar", nullable: true })
  lifeExpectancy!: string; //normal text

  @Column({ type: "text", nullable: true })
  history!: string; //html content

  @Column({ type: "text", nullable: true })
  culture!: string; //html content

  @Column({ type: "text", nullable: true })
  geography!: string; //html content

  @Column({ type: "text", nullable: true })
  conclusion!: string; //normal text

  @Column({ type: "json", nullable: true })
  SEO!: {}; //.metaTitle .metaDescription .metaKeywords .ogTitle .ogDescription

  @Column({ type: "json", nullable: true })
  nationalSymbols!: {}; //.flag .animal .flower

  @Column({ type: "json", nullable: true })
  majorIndustries!: string[]; //["","",""]

  @Column("json", { nullable: true })
  majorCities!: any[]; //[].name [].description

  @Column("json", { nullable: true })
  funFacts!: any[]; //[].heading [].content

  @Column("json", { nullable: true })
  weirdFacts!: any[]; //[].heading [].content

  @Column({ type: "text", nullable: true })
  currentAffairs!: string; //html content

  @Column({ type: "text", nullable: true })
  touristAttractions!: string; //html content

  @Column("json", { nullable: true })
  author!: {}; //.name .about

  @ManyToOne(() => Country, (country) => country.translations)
  @JoinColumn()
  country!: Country;
}
