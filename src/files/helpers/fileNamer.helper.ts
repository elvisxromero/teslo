import { v4 as uuid } from 'uuid';

export const fileNamer =  ( 
    req: Express.Request, // con Express.algo, indico que lo va a buscar de mi core que esta en express y no tngo que importarlo
    file: Express.Multer.File, 
    callback:Function) =>  {

        const fileExtension = file.mimetype.split('/')[1]; // obtengo extension

        const fileName = `${uuid()}.${fileExtension}`
     
        callback(null,fileName)
}