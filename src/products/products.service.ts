import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { NotFoundError } from 'rxjs';

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

  // Aun falta paginar
  findAll() {
    return this.producRepository.find();
  }

  async findOne(id: string) {
    const product = await this.producRepository.findOneBy({id:id})

    if(!product){
      throw new NotFoundException(`El producto con el id ${id} no existe`)
    }

    return product;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
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
