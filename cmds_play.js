const { Quiz } = require("./model.js").models;

// Creacion del juego
exports.play = async (rl) => {
  //Obtenemos los quizzes de la base de datos
  let quizzes = await Quiz.findAll();

  //Variables para controlar el numero aleatorio y la puntuacion
  let aleatorio, puntuacion = 0;

  while (quizzes.length > 0) {
    //Obtenemos de forma aleatoria un numero (margen 0 hasta la longitud -1)
    aleatorio = Math.floor(Math.random() * (quizzes.length - 1));

    //Obtenemos el resultado de sacar por pantalla la pregunta del quizz aleatorio
    let respuesta = await rl.questionP(quizzes[aleatorio].question);

    //Comparamos la respuesta introducida con la respuesta del quizz
    if (respuesta.toLowerCase().trim() === quizzes[aleatorio].answer.toLowerCase().trim()) {
        //Respuesta correcta: mensaje por pantalla y sumamos puntuacion
      rl.log(`  The answer "${respuesta}" is right!`);
      puntuacion += 1;
    } else {
        //Respuesta incorrecta: mensaje por pantalla, llamada a metodo, y finalizar
      rl.log(`  The answer "${respuesta}" is wrong!`);
      mostrarPuntuacion(rl, puntuacion);
      return;
    }

    //Borramos con splice el elemento i del array
    quizzes.splice(aleatorio, 1);
  }

  //Una vez acabado el juego exitosamente llamamos al metodo para mostrar la puntuacion
  mostrarPuntuacion(rl, puntuacion);
}

//Metodo para sacar por pantalla la puntuacion obtenida
function mostrarPuntuacion(rl, puntos) {
    rl.log(`  Score: ${puntos}`);
};
