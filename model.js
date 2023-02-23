const { Sequelize, Model, DataTypes } = require("sequelize");

const options = { logging: false };
const sequelize = new Sequelize("sqlite:db.sqlite", options);

class User extends Model {}
class Quiz extends Model {}
class Score extends Model {}

//Modelo para la tabla de usuarios: Usuarios
User.init(
  {
    name: {
      type: DataTypes.STRING,
      unique: { msg: "Name already exists" },
      allowNull: false,
      validate: {
        isAlphanumeric: { args: true, msg: "name: invalid characters" },
      },
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
        min: { args: [0], msg: "Age: less than 0" },
        max: { args: [140], msg: "Age: higher than 140" },
      },
    },
  },
  { sequelize }
);

//Modelo para la tabla de quizzes: Quizzes
Quiz.init(
  {
    question: {
      type: DataTypes.STRING,
      unique: { msg: "Quiz already exists" },
    },
    answer: DataTypes.STRING,
  },
  { sequelize }
);

//Modelo para la tabla de puntuaciones: Scores
Score.init(
  {
    wins: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
        min: { args: [0], msg: "Score: less than 0" },
      },
    },
  },
  { sequelize }
);

//Relacion User-->Quizz (1:N)
Quiz.belongsTo(User, {
  as: "author",
  foreignKey: "authorId",
  onDelete: "CASCADE",
});

User.hasMany(Quiz, {
  as: "posts",
  foreignKey: "authorId",
});

// Relation User<-->Quizz (N:N), Tabla intermedia Favourites relations default is -> onDelete: 'cascade'
User.belongsToMany(Quiz, {
  as: "fav",
  foreignKey: "userId",
  otherKey: "quizId",
  through: "Favourites",
});

Quiz.belongsToMany(User, {
  as: "fan",
  foreignKey: "quizId",
  otherKey: "userId",
  through: "Favourites",
});

//Relacion User-->Score (1:N)
Score.belongsTo(User, {
  as: "scores",
  foreignKey: "userId",
  onDelete: "CASCADE",
});

User.hasMany(Score, {
  as: "scored",
  foreignKey: "userId",
});

module.exports = sequelize;
