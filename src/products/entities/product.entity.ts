import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"; //

@Entity() // Para que sea reconocida como entidad, se debe añadir el decorador entity e importarlo desde typeorm
export class Product {

    @PrimaryGeneratedColumn('uuid')
    id:string;

    @Column('text',{ // Defino el tipo y puedo definir reglas
        unique:true
    })
    title: string;

    @Column('numeric',{
        default:0
    })
    price: number;

    @Column({
        type:'text',
        nullable:true
    })
    description:string;

    @Column('text',{
        unique:true
    })
    slug: string;

    @Column('int',{
        default: 0
    })
    stock: number;

    @Column('text',{
        array:true
    })
    sizes: string[]

    @Column({
        type: 'varchar',
        length: 255,
    })
    gender: string;
}
