// UserService.js
// Este modulo representa el lado "Cliente" de la arquitectura Cliente-Servidor.
// Aquí enviamos los datos al "API Gateway" de tu arquitectura.

export const createUsuario = async (userData) => {
  // En un entorno real, aquí harías un fetch() a tu API Gateway RESTful
  console.log("Enviando datos al servidor a través del API Gateway...", userData);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ status: 201, message: "Usuario creado exitosamente" });
    }, 1000);
  });
};