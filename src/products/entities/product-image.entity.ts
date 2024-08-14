import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";

@Entity({
    name: 'product_images' // Defino el nombre de la tabla 
})
export class ProductImage {

    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    url: string;

    @ManyToOne(
        () => Product,
        (product) => product.images,
        { onDelete : 'CASCADE' } // Indica que si elimino el producto, en cascada elimine las imagenes asociaadas
    )
    product: Product // Tiene que ser del tipo referenciado

}