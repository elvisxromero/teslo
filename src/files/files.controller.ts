import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException, Get, Param, Res } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Response } from 'express';
import { fileFilter } from './helpers/fileFilter.helper';
import { fileNamer } from './helpers/fileNamer.helper';
import { ConfigService } from '@nestjs/config';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService
  ) {}

  @Get('product/:imageName')
  findProductImage(
    @Res() res: Response, //  Si pido el Res, obligo al metodo que la respuesta sea del res
    @Param('imageName') imageName: string
  ){
    const path = this.filesService.getStaticProductImage( imageName )
    
    res.sendFile(path)
  }


  @Post('product')
  @UseInterceptors( FileInterceptor('file',{
    fileFilter: fileFilter,
    // limits // Se pueden añadir propiedades para limitar
    storage: diskStorage({ // Lo utiliza desde multer para definir donde y como guardar
      destination: './public/products',
      filename: fileNamer
    }) 
  })) // Se debe ocupar file interceptor para indicar el nombre del parametro que traera el archivo
  uploadFile(
    @UploadedFile() // Decorador para detectar tipo archivo
    file: Express.Multer.File // Espero un archivo de tipo file
  ){
    if(!file)  throw new BadRequestException('Envia una imagen') // Sino tenemos archivo validado correctamente
    
    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${file.filename}`

    return {secureUrl}
  }
}
