// IMPORTS
const path = require('path');
const Utils = require('./testutils');

const node_modules = path.resolve(path.join(__dirname, "../", "node_modules"));
const database = 'sqlite:db.sqlite';
const options = { logging: false};
var sequelize, User, Quiz;
const path_models = path.resolve(path.join(__dirname, "../model.js"));
const path_assignment = path.resolve(path.join(__dirname, "../"));

const T_TEST = 2 * 60; // Time between tests (seconds)
// CRITICAL ERRORS
let error_critical = null;

//TESTS
describe("(Prechecks) Entrega5_BBDD_Dependencias", function () {

    this.timeout(T_TEST * 1000);

    it("(Precheck) Comprobando que las dependencias están instaladas...", async function () {
        this.score = 0;
        this.msg_ok = `Encontrado el directorio '${node_modules}'`;
        this.msg_err = `No se encontró el directorio '${node_modules}'`;
        try {
            const fileexists = await Utils.checkFileExists(node_modules);
            if (!fileexists) {
                error_critical = this.msg_err;
            }
            fileexists.should.be.equal(true);
        } catch (err) { error_critical = err;}
    });

});

describe("(Prechecks) Entrega5_BBDD_Modelos", function () {

    this.timeout(T_TEST * 1000);

    before(function() {
        const { Sequelize } = require('sequelize');
        sequelize = new Sequelize(database, options);
    });

    it("(Precheck): Comprobando que la tabla Users existe en la base de datos...", async function () {
        this.score = 0;
        this.msg_ok = `Encontrada la tabla Users en la base de datos '${database}'`;
        this.msg_err = `No se encontró la tabla Users en la base de datos '${database}'`;
        try {
            const res = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table' AND name='Users'");
      
            if (res[0].length !== 1) {
                error_critical = this.msg_err;
            }
            res[0].length.should.be.equal(1);
        } catch (err) { error_critical = err;}
    });

    it("(Precheck): Comprobando que la tabla Quizzes existe en la base de datos...", async function () {
        this.score = 0;
        this.msg_ok = `Encontrada la tabla Quizzes en la base de datos '${database}'`;
        this.msg_err = `No se encontró la tabla Quizzes en la base de datos '${database}'`;
        try {
            const res = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table' AND name='Quizzes'");
            if (res[0].length !== 1) {
                error_critical = this.msg_err;
            }
            res[0].length.should.be.equal(1);
        } catch (err) { error_critical = err;}
    });

    it("(Precheck): Comprobando que la tabla Favourites existe en la base de datos...", async function () {
        this.score = 0;
        this.msg_ok = `Encontrada la tabla Favourites en la base de datos '${database}'`;
        this.msg_err = `No se encontró la tabla Favourites en la base de datos '${database}'`;
        try {
            const res = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table' AND name='Favourites'");
            if (res[0].length !== 1) {
                error_critical = this.msg_err;
            }
            res[0].length.should.be.equal(1);
        } catch (err) { error_critical = err;}
    });

    it("(Precheck): Comprobando que existe el fichero de modelos...", async function () {
        this.score = 0;
        this.msg_ok = `Encontrado el fichero '${path_models}'`;
        this.msg_err = `No se encontró el fichero '${path_models}'`;
        try {
            const fileexists = await Utils.checkFileExists(path_models);
            if (!fileexists) {
                error_critical = this.msg_err;
            }
            fileexists.should.be.equal(true);
        } catch (err) { error_critical = err;}
    });

    it("(Precheck): Comprobando que existe el modelo User...", async function () {
        this.score = 0;
        this.msg_ok = `Encontrado el modelo User`;
        this.msg_err = `No se encontró el modelo User`;
        const { User } = require(path_models).models;
        if (!User) {
            error_critical = this.msg_err;
        }
        User.should.not.be.undefined;
    });

    it("(Precheck): Comprobando que existe el modelo Quiz...", async function () {
        this.score = 0;
        this.msg_ok = `Encontrado el modelo Quiz`;
        this.msg_err = `No se encontró el modelo Quiz`;
        const { Quiz } = require(path_models).models;
        if (!Quiz) {
            error_critical = this.msg_err;
        }
        Quiz.should.not.be.undefined;
    });
});

describe("(Checks) Pruebas funcionales", function () {

    const spawn = require("child_process").spawn;
    const timeout = ms => new Promise(res => setTimeout(res, ms));
    const T_WAIT = 1; // Time between commands
    const number_of_quizzes = 5;
    const number_of_tries_to_check_random = 5;

    this.timeout(T_TEST * 1000);

    var added_quizzes = [];
    var added_users = [];
    let client = null;

    before(async function() {
        const { Sequelize } = require('sequelize');
        sequelize = new Sequelize(database, options);
        User = require(path_models).models.User;
        Quiz = require(path_models).models.Quiz;

        let name = Utils.makeString(20);
        let age = Utils.makeInteger(0, 140);

        try {

            let u = await User.create( 
              { name, age }
            );

            added_users.push(u);

            let quizzes = await Quiz.findAll();

            if (quizzes.length < number_of_quizzes) {
                for (let i = 0; i < number_of_quizzes - quizzes.length; i++) {
                    let question = Utils.makeString(20);
                    let answer = Utils.makeString(20);
                    let q = await Quiz.create( 
                      { question,
                        answer,
                        authorId: u.id
                      }
                    );
                    added_quizzes.push(q);
                }
            }
        } catch (err) { error_critical = err;}
    });

    it("1: Comprobando que el comando p está soportado...", async function () {
        this.score = 0.5;
        if (error_critical) {
            this.msg_err = error_critical;
            should.not.exist(error_critical);
        } else {
            this.msg_err = "El comando p no está soportado";
            this.msg_ok = "El comando p está soportado";

            const input = ["p"];

            let output = "";
            let error_std = "";

            client = spawn("node", ["main.js"], {cwd: path_assignment});
            client.on('error', function (data) {
                error_std += data
            });
            client.stdout.on('data', function (data) {
                output += data
            });
            await timeout(T_WAIT * 1000);
            client.stdin.write(input[0] + "\n");
            await timeout(T_WAIT * 1000);
            if (client) {
                client.kill();
            }

            error_std.should.be.equal("");
            Utils.search('UNSUPPORTED COMMAND', output).should.be.equal(false);
            Utils.search('TypeError', output).should.be.equal(false);
        }
    });

    it("2: Comprobando que el comando p muestra la pregunta de un quiz de la base de datos...", async function () {
        this.score = 1;
        if (error_critical) {
            this.msg_err = error_critical;
            should.not.exist(error_critical);
        } else {
            this.msg_err = "El comando p no muestra el campo question de un quiz de la base de datos";
            this.msg_ok = "El comando p muestra el campo question de un quiz de la base de datos";

            const input = ["p"];

            let output = "";
            let error_std = "";

            client = spawn("node", ["main.js"], {cwd: path_assignment});
            client.on('error', function (data) {
                error_std += data
            });
            client.stdout.on('data', function (data) {
                output += data
            });
            await timeout(T_WAIT * 1000);
            client.stdin.write(input[0] + "\n");
            await timeout(T_WAIT * 1000);
            if (client) {
                client.kill();
            }

            let question = output.split('>   ')[1].split(': ')[0];

            try {
                let q = await Quiz.findOne({where: {question}});
                if (q === null) {
                    this.msg_err += '. No se encuentra en la BBDD: ----' + question + '----';
                }
                error_std.should.be.equal("");
                should.not.equal(q, null);
            } catch (err) { 
                error_critical = err;
                should.not.exist(error_critical);
            }
        }
    });

    it("3: Comprobando que el comando p muestra las preguntas de manera aleatoria...", async function () {
        this.score = 0.5;
        if (error_critical) {
            this.msg_err = error_critical;
            should.not.exist(error_critical);
        } else {
            this.msg_err = "El comando p no muestra las preguntas de manera aleatoria";
            this.msg_ok = "El comando p muestra las preguntas de manera aleatoria";

            const input = ["p"];
            let output = "";
            let error_std = "";
            let last_question = null;

            try {

                for (var i = 0; i < number_of_tries_to_check_random; i++) {

                    output = "";
                    
                    client = spawn("node", ["main.js"], {cwd: path_assignment});
                    client.on('error', function (data) {
                        error_std += data;
                    });
                    client.stdout.on('data', function (data) {
                        output += data;
                    });
                    await timeout(T_WAIT * 1000);
                    client.stdin.write(input[0] + "\n");
                    await timeout(T_WAIT * 1000);
                    if (client) {
                        client.kill();
                    }

                    let question = output.split('>   ')[1].split(': ')[0];
                    let q = await Quiz.findOne({where: {question}});

                    if (last_question !== null && q.question !== last_question) break;

                    last_question = q.question;
                }
                error_std.should.be.equal("");
                i.should.be.at.most(number_of_tries_to_check_random - 1);
            } catch (err) { 
                error_critical = err;
                should.not.exist(error_critical);
            }
        }
    });

    it("4: Comprobando que al contestar correctamente a una pregunta se muestra el mensaje correspondiente y la siguiente si hay más disponibles...", async function () {
        this.score = 0.5;
        if (error_critical) {
            this.msg_err = error_critical;
            should.not.exist(error_critical);
        } else {
            this.msg_err = "Al contestar correctamente a una pregunta no se muestra la siguiente habiendo más disponibles";
            this.msg_ok = "Al contestar correctamente a una pregunta se muestra la siguiente cuando hay más disponibles";

            const input = ["p"];
            let output = "";
            let error_std = "";

            client = spawn("node", ["main.js"], {cwd: path_assignment});
            client.on('error', function (data) {
                error_std += data;
            });
            client.stdout.on('data', function (data) {
                output += data;
            });
            await timeout(T_WAIT * 1000);
            client.stdin.write(input[0] + "\n");
            await timeout(T_WAIT * 1000);
            
            let question = output.split('>   ')[1].split(': ')[0];

            try {
                let q = await Quiz.findOne({where: {question}});
                
                output = "";
                client.stdin.write(q.answer + "\n");
                await timeout(T_WAIT * 1000);
                
                if (client) {
                    client.kill();
                }

                Utils.search('right', output).should.be.equal(true);
                let newline = output.split('\n  ')[1];
            
                should.not.equal(newline, undefined);

                question = newline.split(': ')[0];
                
                q = await Quiz.findOne({where: {question}});
            
                error_std.should.be.equal("");
                should.not.equal(q, null);
            } catch (err) { 
                error_critical = err;
                should.not.exist(error_critical);
            }
        }
    });

    it("5: Comprobando que al contestar correctamente a una pregunta se muestra el mensaje correspondiente y la puntuación si no hay más disponibles...", async function () {
        this.score = 0.5;
        if (error_critical) {
            this.msg_err = error_critical;
            should.not.exist(error_critical);
        } else {
            this.msg_err = "Al contestar correctamente a una pregunta no se muestra la puntuación si no hay más disponibles";
            this.msg_ok = "Al contestar correctamente a una pregunta se muestra la puntuación si no hay más disponibles";

            const input = ["p"];
            let output = "";
            let error_std = "";

            client = spawn("node", ["main.js"], {cwd: path_assignment});
            client.on('error', function (data) {
                error_std += data;
            });
            client.stdout.on('data', function (data) {
                output += data;
            });
            await timeout(T_WAIT * 1000);
            client.stdin.write(input[0] + "\n");
            await timeout(T_WAIT * 1000);
            
            let question = output.split('>   ')[1].split(': ')[0];

            try {
                let q = await Quiz.findOne({where: {question}});
                
                output = "";
                client.stdin.write(q.answer + "\n");
                await timeout(T_WAIT * 1000);

                for (let i = 0; i < 4; i++) {
                    question = output.split('\n  ')[1].split(': ')[0];
                    output = "";
                    q = await Quiz.findOne({where: {question}});
                    client.stdin.write(q.answer + "\n");
                    await timeout(T_WAIT * 1000);
                }
                
                if (client) {
                    client.kill();
                }
                
                Utils.search('right', output).should.be.equal(true);
                Utils.search('Score', output).should.be.equal(true);
                Utils.search('5', output).should.be.equal(true);
                error_std.should.be.equal("");
            } catch (err) { 
                error_critical = err;
                should.not.exist(error_critical);
            }
        }
    });

    it("6: Comprobando que al contestar incorrectamente a una pregunta se muestra el mensaje correspondiente y la puntuación...", async function () {
        this.score = 1;
        if (error_critical) {
            this.msg_err = error_critical;
            should.not.exist(error_critical);
        } else {
            this.msg_err = "Al contestar incorrectamente a una pregunta no se muestra la puntuación";
            this.msg_ok = "Al contestar incorrectamente a una pregunta se muestra la puntuación";

            const input = ["p"];
            let output = "";
            let error_std = "";

            client = spawn("node", ["main.js"], {cwd: path_assignment});
            client.on('error', function (data) {
                error_std += data;
            });
            client.stdout.on('data', function (data) {
                output += data;
            });
            await timeout(T_WAIT * 1000);
            client.stdin.write(input[0] + "\n");
            await timeout(T_WAIT * 1000);
            
            let question = output.split('>   ')[1].split(': ')[0];

            try {
                let q = await Quiz.findOne({where: {question}});
                
                output = "";
                client.stdin.write(Utils.makeString(20) + "\n");
                await timeout(T_WAIT * 1000);

                if (client) {
                    client.kill();
                }

                Utils.search('wrong', output).should.be.equal(true);
                Utils.search('Score', output).should.be.equal(true);
                Utils.search('0', output).should.be.equal(true);
                error_std.should.be.equal("");
            } catch (err) { 
                error_critical = err;
                should.not.exist(error_critical);
            }
        }
    });

    it("7: Comprobando que el modelo Score existe y es correcto...", async function () {
        this.score = 1;
        this.msg_ok = `Encontrado el modelo Score y es correcto`;
        this.msg_err = `No se encontró el modelo Score o falla alguno de sus requsitos`;
        const { Score } = require(path_models).models;
        Score.should.not.be.undefined;
        Score.rawAttributes.wins.should.not.be.undefined;
        Score.rawAttributes.wins.type.key.should.be.equal('INTEGER');
        Score.rawAttributes.wins.allowNull.should.be.equal(false);

        if (!Score.rawAttributes.userId) 
            this.msg_err += '. Has creado las relaciones entre los modelos Score y User?'

        Score.rawAttributes.userId.should.not.be.undefined;
        Score.rawAttributes.userId.references.model.should.be.equal('Users');
    });

    it("8: Comprobando que la tabla Scores existe en la base de datos y es correcta...", async function () {
        this.score = 1;
        this.msg_ok = `Encontrada la tabla Scores en la base de datos '${database}' y es correcta`;
        this.msg_err = `No se encontró la tabla Scores en la base de datos '${database}' o no es correcta`;

        try {
            const res = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table' AND name='Scores'");
            res[0].length.should.be.equal(1);
            
            const res2 = await sequelize.query("SELECT sql FROM sqlite_master WHERE type='table' AND name='Scores'");
            if (!Utils.search('createdAt', res2[0][0].sql)) 
                this.msg_err += '. Tiene fecha de creación la tabla en la migración?'
            Utils.search('createdAt', res2[0][0].sql).should.be.equal(true);
            
            if (!Utils.search('REFERENCES', res2[0][0].sql)) 
                this.msg_err += '. Has creado las relaciones entre los modelos Score y User en la migración?';
            Utils.search('REFERENCES', res2[0][0].sql).should.be.equal(true);
        } catch (err) {  
            error_critical = err;
            should.not.exist(error_critical);
        }

    });

    it("9: Comprobando que al terminar de jugar se almacena la puntuación de un usuario existente en la base de datos...", async function () {
        this.score = 1.5;
        if (error_critical) {
            this.msg_err = error_critical;
            should.not.exist(error_critical);
        } else {
            this.msg_err = "Al terminar de jugar no se almacena la puntuación de un usuario existente en la base de datos";
            this.msg_ok = "Al terminar de jugar se almacena la puntuación de un usuario existente en la base de datos";

            const input = ["p"];
            let output = "";
            let error_std = "";

            client = spawn("node", ["main.js"], {cwd: path_assignment});
            client.on('error', function (data) {
                error_std += data;
            });
            client.stdout.on('data', function (data) {
                output += data;
            });
            await timeout(T_WAIT * 1000);
            client.stdin.write(input[0] + "\n");
            await timeout(T_WAIT * 1000);
            
            let question = output.split('>   ')[1].split(': ')[0];

            try {
                let q = await Quiz.findOne({where: {question}});
                
                output = "";
                client.stdin.write(Utils.makeString(20) + "\n");
                await timeout(T_WAIT * 1000);

                client.stdin.write(added_users[0].name + "\n");
                await timeout(T_WAIT * 1000);
                
                
                Score = require(path_models).models.Score;

                let u = await User.findOne({
                    where: {name: added_users[0].name},
                    include: [
                      { model: Score, as: 'scores'}
                    ]
                });

                if (client) {
                    client.kill();
                }

                should.not.equal(u, null);
                should.not.equal(u.scores.length, 0);
                u.scores[0].wins.should.be.equal(0);
            } catch (err) { 
                error_critical = err;
                should.not.exist(error_critical);
            }
        }
    });

    it("10: Comprobando que al terminar de jugar se almacena la puntuación de un usuario no existente en la base de datos...", async function () {
        this.score = 1.5;
        if (error_critical) {
            this.msg_err = error_critical;
            should.not.exist(error_critical);
        } else {
            this.msg_err = "Al terminar de jugar no se almacena la puntuación de un usuario no existente en la base de datos";
            this.msg_ok = "Al terminar de jugar se almacena la puntuación de un usuario no existente en la base de datos";

            const input = ["p"];
            let output = "";
            let error_std = "";

            client = spawn("node", ["main.js"], {cwd: path_assignment});
            client.on('error', function (data) {
                error_std += data;
            });
            client.stdout.on('data', function (data) {
                output += data;
            });
            await timeout(T_WAIT * 1000);
            client.stdin.write(input[0] + "\n");
            await timeout(T_WAIT * 1000);

            let question = output.split('>   ')[1].split(': ')[0];

            try {
                let q = await Quiz.findOne({where: {question}});
                
                output = "";
                client.stdin.write(q.answer + "\n");
                await timeout(T_WAIT * 1000);

                for (let i = 0; i < 2; i++) {
                    question = output.split('\n  ')[1].split(': ')[0];
                    output = "";
                    q = await Quiz.findOne({where: {question}});
                    client.stdin.write(q.answer + "\n");
                    await timeout(T_WAIT * 1000);
                }

                question = output.split('\n  ')[1].split(': ')[0];
                output = "";

                q = await Quiz.findOne({where: {question}})
                client.stdin.write(Utils.makeString(20) + "\n");
                await timeout(T_WAIT * 1000);

                let name = Utils.makeString(20);

                client.stdin.write(name + "\n");
                await timeout(T_WAIT * 1000);
                
                Score = require(path_models).models.Score;

                let u = await User.findOne({
                    where: {name: name},
                    include: [
                      { model: Score, as: 'scores'}
                    ]
                });

                added_users.push(u);

                if (client) {
                    client.kill();
                }

                should.not.equal(u, null);
                should.not.equal(u.scores.length, 0);
                u.scores[0].wins.should.be.equal(3);
            } catch (err) { 
                error_critical = err;
                should.not.exist(error_critical);
            }
        }
    });

    it("11: Comprobando que las puntuaciones se muestran correctamente al usar el comando ls...", async function () {
        this.score = 1;
        if (error_critical) {
            this.msg_err = error_critical;
            should.not.exist(error_critical);
        } else {
            this.msg_err = "Las puntuaciones no se muestran correctamente al usar el comando ls";
            this.msg_ok = "Las puntuaciones se muestran correctamente al usar el comando ls";

            const input = ["ls"];

            let output = "";
            let error_std = "";

            client = spawn("node", ["main.js"], {cwd: path_assignment});
            client.on('error', function (data) {
                error_std += data
            });
            client.stdout.on('data', function (data) {
                output += data
            });
            await timeout(T_WAIT * 1000);
            client.stdin.write(input[0] + "\n");
            await timeout(T_WAIT * 1000);
            if (client) {
                client.kill();
            }

            if (error_std !== "")
                this.msg_err += '. Hay algún error de ejecución del comando?';

            error_std.should.be.equal("");
            Utils.search('UNSUPPORTED COMMAND', output).should.be.equal(false);
            Utils.search('TypeError', output).should.be.equal(false);

            try {

                let u1 =  await User.findOne({
                    where: {name: added_users[0].name},
                    include: [
                      { model: Score, as: 'scores'}
                    ]
                });

                let s1 = `${u1.name}|0|`;

                let u2 =  await User.findOne({
                    where: {name: added_users[1].name},
                    include: [
                      { model: Score, as: 'scores'}
                    ]
                });

                let s2 = `${u2.name}|3|`;

                if (!Utils.search(s1, output))
                    this.msg_err += '. Estás pintando las puntuaciones de acuerdo al formato pedido?';

                Utils.search(s1, output).should.be.equal(true);
                Utils.search(s2, output).should.be.equal(true);
                
                let posU1 = output.toString().toLowerCase().indexOf(u1.name.toLowerCase());
                let posU2 = output.toString().toLowerCase().indexOf(u2.name.toLowerCase());

                if (posU2 > posU1)
                    this.msg_err += '. Están las puntuaciones ordenadas?';
                (posU2 < posU1).should.be.equal(true);
            } catch (err) { 
                error_critical = err;
                should.not.exist(error_critical);
            }   
        }
    });

    afterEach(function () {
        if (client) {
            client.kill();
        }
    });

    after(async function() {
        const { Sequelize } = require('sequelize');
        sequelize = new Sequelize(database, options);
        User = require(path_models).models.User;
        Quiz = require(path_models).models.Quiz;

        try {
            added_quizzes.forEach( 
                async q => { 
                    await q.destroy();
                }
            );

            added_users.forEach( 
                async u => { 
                    await u.destroy();
                }
            );
        } catch (err) { console.log('Error removing users and quizzes');}  

    });
});