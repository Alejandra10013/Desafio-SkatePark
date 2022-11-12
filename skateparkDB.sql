CREATE DATABASE skatepark;

CREATE TABLE skaters (
	id SERIAL, 
	email VARCHAR(50) NOT NULL, 
	nombre VARCHAR(25) NOT NULL, 
	password VARCHAR(25) NOT NULL, 
	anios_experiencia INT NOT NULL, 
	especialidad VARCHAR(50) NOT NULL, 
	foto VARCHAR(255) not NULL, 
	estado BOOLEAN NOT null
);

select * from skaters;