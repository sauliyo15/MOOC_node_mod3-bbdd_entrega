const { Quiz, User, Score } = require("./model.js").models;

// Creacion del juego
exports.play = async (rl) => {
  //Obtenemos los quizzes de la base de datos
  let quizzes = await Quiz.findAll();

  //Variables para controlar el numero aleatorio y la puntuacion
  let aleatorio,
    puntuacion = 0;

  while (quizzes.length > 0) {
    //Obtenemos de forma aleatoria un numero (margen 0 hasta la longitud -1)
    aleatorio = Math.floor(Math.random() * (quizzes.length - 1));

    //Obtenemos el resultado de sacar por pantalla la pregunta del quizz aleatorio
    let respuesta = await rl.questionP(quizzes[aleatorio].question);

    //Comparamos la respuesta introducida con la respuesta del quizz
    if (
      respuesta.toLowerCase().trim() ===
      quizzes[aleatorio].answer.toLowerCase().trim()
    ) {
      //Respuesta correcta: mensaje por pantalla y sumamos puntuacion
      rl.log(`  The answer "${respuesta}" is right!`);
      puntuacion += 1;
    } else {
      //Respuesta incorrecta: mensaje por pantalla
      rl.log(`  The answer "${respuesta}" is wrong!`);

      //Llamada al metodo para mostrar la puntuacion
      mostrarPuntuacion(rl, puntuacion);

      //Llamada al metodo para guardar la puntuacion en la base de datos
      guardarPuntuacion(rl, puntuacion);

      //Finalizar
      return;
    }

    //Borramos con splice el elemento i del array
    quizzes.splice(aleatorio, 1);
  }

  //Una vez acabado el juego exitosamente llamamos al metodo para mostrar la puntuacion
  mostrarPuntuacion(rl, puntuacion);

  //Llamada al metodo para guardar la puntuacion en la base de datos
  guardarPuntuacion(rl, puntuacion);
};

//Metodo para sacar por pantalla la puntuacion obtenida
function mostrarPuntuacion(rl, puntos) {
  rl.log(`  Score: ${puntos}`);
}

//Metodo para guardar la puntuacion en la base de datos
async function guardarPuntuacion(rl, puntos) {
  //Obtenemos el resultado de sacar por pantalla la pregunta del quizz aleatorio
  let nombre = await rl.questionP("Please tip your name");

  //Comprobamos si hay algun usuario con ese nombre haciendo consulta a la base de datos.
  let users = await User.findAll({ where: { name: nombre } });

  //Se comprueba si se ha obtenido algun registro
  if (users.length === 0) {
    //No existe el usuario en la base de datos

    //Creamos el usuario nuevo con su nombre y edad 0, obtiendo una instancia de el en la variable 'usuarioNuevo'
    let usuarioNuevo = await User.create({ name: nombre, age: 0 });

    //Guardamos la puntuacion en la base de datos con el id del nuevo usuario
    await Score.create({ wins: puntos, userId: usuarioNuevo.id });
  } else {
    //El usuario si existe en la base de datos

    //Guardamos la puntuacion en la base de datos con el id del usuario ya existente
    await Score.create({ wins: puntos, userId: users[0].id });
  }
}

//Mostrar todos las puntuaciones almacenadas en la base de datos
exports.listScore = async (rl) => {

  //Guardamos la consulta de las puntuaciones en la variable 'scores'
  let scores = await Score.findAll({
    include: [{
      model: User,
      as: 'scored' //mediante la propiedad scored se accede a la relacion que nos da acceso al nombre del usuario (relacion)
    }],
    order: [["wins", "DESC"]], //Orden descendente
  });
  scores.forEach((score) =>
    rl.log(`${score.scored.name}|${score.wins}|${score.createdAt.toUTCString()}`)
  );
};
