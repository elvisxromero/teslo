import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product, ProductImage } from './entities/';


@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports: [
    TypeOrmModule.forFeature([Product, ProductImage]) // importo al modulo, me producto para que sea reconocido por el modulo principal
  ],
  exports: [ProductsService]
})
export class ProductsModule {}
