export const fileFilter =  ( 
    req: Express.Request, // con Express.algo, indico que lo va a buscar de mi core que esta en express y no tngo que importarlo
    file: Express.Multer.File, 
    callback:Function) =>  {

        const fileExtension = file.mimetype.split('/')[1]; // obtengo extension

        const validExtension = ['jpg','jpeg','png','gif']

        if( validExtension.includes( fileExtension )){
            return callback(null,true)
        }

        callback(null,false)
}