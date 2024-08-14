import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { isUUID } from 'class-validator';
import { Product,ProductImage } from './entities';
import { query } from 'express';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductService') // Importo logger para saber que está fallando dentro de mi aplicacion
  
  constructor(
    @InjectRepository(Product) // Inyectamos nuestra entidad, se pueden inyectar varios repositorios
    private readonly producRepository: Repository<Product>, // sirve para insertar, querybuilder, transacciones, rollback, etc

    @InjectRepository(ProductImage) // Inyectamos nuestra entidad, se pueden inyectar varios repositorios
    private readonly producImageRepository: Repository<ProductImage>, // sirve para insertar, querybuilder, transacciones, rollback, etc

    private readonly dataSource: DataSource, // Para ejecutar query runner y trae la configuracion de la base de datos

  ){} // Importar para trabajar con patron repositorio

  async create(createProductDto: CreateProductDto) {
    try {

      const { images = [] , ...productDetails } = createProductDto;

      const product = this.producRepository.create({
        ...productDetails,
        images: images.map( image => this.producImageRepository.create({ url: image }))
      }) // Creo instancia del producto a insertar a nivel de propiedades, aun no inserto en bdd
      await this.producRepository.save(product); //guardo en la base de datos

      return { ...product, images }; //utilizo operador spread ... tres puntos y lo que hace es sobre escribir la imagen que ya trae, porla imagen que le envio

    } catch (error) {
      this.validacionErroresDB(error)
    }
  }

  // 
  findAll(paginationDto:PaginationDto) { // Añado el PaginationDTO para indicar que es de tipo paginationDTO

    const { limit = 10 , offset = 0 } = paginationDto;
    return this.producRepository.find({
      take: limit,
      skip: offset,
      // Hacer relaciones
      relations: {
        images: true
      }
    });

    /**
     const products = await this.producRepository.find({
      take: limit,
      skip: offset,
      // Hacer relaciones
      relations: {
        images: true
      }

      // retorno algo mas elaborado solo con  imagenes sin sus datos extras

      return products.map( product => ({
      ...product, // indico que estoy retornando algo de tipo product, 
      images: product.images.map( img => img.url ) // Pero indico que la propiedad de images, retorne solo las url // recorrro imagenes

      }))
     * * */
  }

  async findOne(termino_buscado: string) {

    let product: Product;

    if (isUUID(termino_buscado)){
      product = await this.producRepository.findOneBy({id:termino_buscado})
    }else{
      const query= this.producRepository.createQueryBuilder('prod');// Indico que en la entidad creare una query diseñada para busquedas con where u otro //  prod es un alias de la tabla producto en el querybuilder
      product = await query
        .where('title=:title or slug=:slug',{ // Indico que necesitara 2 parametros
          title:termino_buscado,// Defino los parametros que buscará el where
          slug:termino_buscado
        })
      .leftJoinAndSelect('prod.images','prodImages') // El cruce de los campos del left join
      .getOne();// get one es un limit 1 
    }

    if(!product){
      throw new NotFoundException(`El producto con el termino "${termino_buscado}" no existe`)
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    const { images, ...toUpdate } = updateProductDto;// Desestructuro el dto

    const product = await this.producRepository.preload({ // Esto lo prepara para una actualizacion, busca por el id y actualiza segun datos y formato del updateProductDTO
      id,...toUpdate}) // Actualizo con los datos del dto

    if(!product){
      throw new NotFoundException(`Producto con ID: ${id} no existe`)
    }

    // Create Query Runner // TAe permite hacer un commit una vez que todo esté ok
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if( images ){
        await queryRunner.manager.delete( ProductImage, { product: { id:id } } ) // Elimina del productimage, los productos que tengan el id indicado

        product.images = images.map( 
          image => this.producImageRepository.create({ url: image }) // Agrego a image las nuevas url que voy a crear
        )
      } else {
        //
      }

      await queryRunner.manager.save( product ); // Salvo el producto que voy a guardar

      await queryRunner.commitTransaction();// Ejecuta el commit

      await queryRunner.release(); // Libero la conexion


      // await this.producRepository.save( product); Para hacerlo directo con el product repository


      return this.findOne( id );
    } catch (error) {

      await queryRunner.rollbackTransaction(); // En caso de error , hago un rollback
      await queryRunner.release();
      this.validacionErroresDB(error)
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);

    await this.producRepository.remove(product);

  }

  private validacionErroresDB( error: any){

    if ( error.code === '23505')
      throw new BadRequestException(error.detail);

    this.logger.error(error)
    throw new InternalServerErrorException('Revisar error en log del servidor')
  }

  async deleteAllProducts(){
    const query = this.producRepository.createQueryBuilder('product');

    try{
      return await query // Me permite eliminar toda la tabla de producto para limpiar
      .delete()
      .where({})
      .execute();
    } catch( error ){
      this.validacionErroresDB(error)
    }
  }


}
