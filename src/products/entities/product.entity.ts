import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"; //
import { ProductImage } from "./product-image.entity";

@Entity({
    name: 'products' // Defino el nombre de la tabla 
}) // Para que sea reconocida como entidad, se debe añadir el decorador entity e importarlo desde typeorm
export class Product {

    @PrimaryGeneratedColumn('uuid')
    id:string;

    @Column('text',{ // Defino el tipo y puedo definir reglas
        unique:true
    })
    title: string;

    @Column('float',{
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


    @Column({
        type:'text',
        array:true,
        default:[]
    })
    tags: string[];

    //Images asociada a la entidad productImage para compartir llave en la busqueda del producto
    @OneToMany(
        () => ProductImage, // Primer callback que indica a cual esta asociado el campo
        (productImage) => productImage.product, // Segudno callback , que hace repeferencia al campo el cual enlaza la asociacion de la entidad
        {
            cascade: true,// Cascade true, indica que si se elimina el producto principal, borra en cascada sus asociaciones 
            eager: true, // Indica que hace la relacion automatica para el find* -- https://orkhan.gitbook.io/typeorm/docs/eager-and-lazy-relations

        } 
    )
    images?: ProductImage[]; // Tiene que ser del tipo referenciado


    @BeforeInsert() // Antes de insertar ejecuto una funcion
    checkSlugInsert(){

        if(!this.slug){
            this.slug =  this.title
        }

        this.slug = this.slug
        .toLowerCase()
        .replaceAll(' ','')
        .replaceAll("'",'')
    }

    @BeforeUpdate() // Antes de insertar ejecuto una funcion
    checkSlugUpdate(){

        if(!this.slug){
            this.slug =  this.title
        }

        this.slug = this.slug
        .toLowerCase()
        .replaceAll(' ','')
        .replaceAll("'",'')
    }
}
