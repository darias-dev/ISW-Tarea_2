// Este modulo representa el lado "Cliente" de la arquitectura Cliente-Servidor.
// Aquí sse envían los datos al "API Gateway" de tu arquitectura.

export const createUsuario = async (userData) => {
  // Simulamos una llamada al servidor (API Gateway)
  console.log("Enviando datos al servidor a través del API Gateway...", userData);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ status: 201, message: "Usuario creado exitosamente" });
    }, 1000);
  });
};