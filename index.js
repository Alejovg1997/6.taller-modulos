    //librerias externas 
    const express = require('express');
    const fs=require('fs');
    const { v4: uuidv4 } = require('uuid');
    const Joi = require('joi');
    const bookSchema = Joi.object({
        title: Joi.string().required().min(3).max(255),
        author: Joi.string().required().min(3).max(255),
        publicationYear: Joi.number().integer().min(1000).max(new Date().getFullYear()),
        isbn: Joi.string().pattern(/^[0-9]{10,13}$/).required(),
        language: Joi.string().valid('English', 'Spanish', 'French', 'German', 'Other'),
        pageCount: Joi.number().integer().min(1),
        price: Joi.number().precision(2).positive(),
        isAvailable: Joi.boolean(),
      });

    // modulos internos
    const{readFile,writeFile}=require('./src/files');
    const { FILE } = require('dns');
const { request } = require('http');
    const app = express();
    const FILE_NAME='./db/books.txt'
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());

    //Rutas
    app.get('/hola/:name', (req, res) => {
        console.log(req);
        const name = req.params.name;
        const type = req.query.type;
        const formal = req.query.formal;
        res.send(`Hello ${formal ? 'Mr.' : ''} 
        ${name} ${type ? ' ' + type : ''}`);
    });
    app.get('/read-file',(req,res)=>{  // asi se crea una nueva ruta con la operacion get 
        const data=readFile(FILE_NAME);
        res.send(data);
    });

    //API
    // listar libro
    app.get('/books',(req,res)=>{
        const data =readFile(FILE_NAME)
        res.json(data)

    })


    // crear libro   
    app.post('/books', (req, res) => {
        try {
            const data = readFile(FILE_NAME);
            const newBook= req.body;
    
            // Coloca el console.log aquí para ver los datos antes de la validación
            console.log(newBook);
    
            // Validar los datos utilizando el esquema de validación de Joi
            const { error } = bookSchema.validate(newBook);
    
            if (error) {
                // Si hay un error de validación, responde con un código de estado 400 (Bad Request)
                res.status(400).json({ error: error.details[0].message });
                return;
            }
    
            // Si los datos son válidos, procede a agregar la camiseta
            newBook.id = uuidv4();
            data.push(newBook);
    
            //Escribimos en el archivo 
            writeFile(FILE_NAME, data);
            res.json({ message: 'libro ingresado' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al crear libro' });
        }
    });
    //obetener una sola mascota por id 

    app.get('/books/:id',(req,res)=>{
        console.log(req.params.id);
        //Guardar el id 
    const id =req.params.id
    //Leer el contenido del archivo
    const books=readFile(FILE_NAME)
    //Buscar la mascota por el id que recibe 
    const bookFound =books.find(pet=>pet.id===id)
    if(!bookFound){ //si no encuentra la mascota
        res.status(404).json({'ok':false,message:"libro no encontrado"})
        return;
    }
        res.json({'ok':true,pet:bookFound});// si encuentra la mascota 
    })

    //actualizar una mascota 
    app.put('/books/:id',(req,res)=>{
        console.log(req.params.id);
        //Guardar el id 
    const id =req.params.id
    //Leer el contenido del archivo
    const books=readFile(FILE_NAME)
    //Buscar la mascota por el id que recibe 
    const bookIndex =books.findIndex(pet=>pet.id===id)
    if(
        bookIndex<0){ //si no encuentra la mascota
        res.status(404).json({'ok':false,message:"libro no encontrado"})
        return;
    }
    let book=books[bookIndex]// sacar del arreglo
    book={...pet,...req.body}//los tres puntos significan todo lo que ya tenia , junto con lo que le enviaron a pet
    books[bookIndex]=book;//poner la mascota en el mismo indice o posicion
    writeFile(FILE_NAME,books);//reescribir el archivo de txt con la mascota actualizada
        res.json({'ok':true,book:book});// si encuentra la mascota ,modificar sus datos y almacenarlsos nuevamnete 
    })
    // eliminar una mascota
    app.delete('/books/:id',(req,res)=>{
        console.log(req.params.id);
        //Guardar el id 
    const id =req.params.id
    //Leer el contenido del archivo
    const books=readFile(FILE_NAME)
    //Buscar la mascota por el id que recibe 
    const bookIndex =books.findIndex(book=>book.id===id)
    if(bookIndex<0){ //si no encuentra la mascota
        res.status(404).json({'ok':false,message:"libro no encontrado"})
        return;
    }
    //eliminar la mascota en la posicion pet index
    books.splice(bookIndex,1);
    writeFile(FILE_NAME,books);
        res.json({'ok':true,message:"libro retirado de la lista"});// si encuentra la mascota 
    })
    


    app.listen(3000, () => {
        console.log(`Server is running on http://localhost:3000`)
    });