import { existsSync } from 'fs';
import { join } from 'path';

import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class FilesService {
  getStaticProductImage(imageName: string){
    const path = join( __dirname, '../../public/products', imageName)

    if( !existsSync(path) ){
      throw new BadRequestException(`No prodcut found ${imageName}`)
    }

    return path;
  }
}
