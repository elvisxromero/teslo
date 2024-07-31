import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { isUUID } from 'class-validator';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductService') // Importo logger para saber que está fallando dentro de mi aplicacion
  
  constructor(
    @InjectRepository(Product) // Inyectamos nuestra entidad, se pueden inyectar varios repositorios
    private readonly producRepository: Repository<Product>, // sirve para insertar, querybuilder, transacciones, rollback, etc
  ){} // Importar para trabajar con patron repositorio

  async create(createProductDto: CreateProductDto) {
    try {

      const product = this.producRepository.create(createProductDto) // Creo instancia del producto a insertar a nivel de propiedades, aun no nserto en bdd
      await this.producRepository.save(product); //guardo en la base de datos

      return product;

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
    });
  }

  async findOne(termino_buscado: string) {

    let product: Product;

    if (isUUID(termino_buscado)){
      product = await this.producRepository.findOneBy({id:termino_buscado})
    }else{
      const query= this.producRepository.createQueryBuilder();// Indico que en la entidad creare una query diseñada para busquedas con where u otro
      product = await query.where('title=:title or slug=:slug',{ // Indico que necesitara 2 parametros
        title:termino_buscado,// Defino los parametros que buscará el where
        slug:termino_buscado
      }).getOne();// get one es un limit 1 
    }

    if(!product){
      throw new NotFoundException(`El producto con el termino "${termino_buscado}" no existe`)
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.producRepository.preload({ // Esto lo prepara para una actualizacion, busca por el id y actualiza segun datos y formato del updateProductDTO
      id:id,
      ...updateProductDto
    })

    if(!product){
      throw new NotFoundException(`Producto con ID: ${id} no existe`)
    }

    try {
      await this.producRepository.save( product);
      return product;
    } catch (error) {
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
}
