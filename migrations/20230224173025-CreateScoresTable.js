"use strict";

//Este fichero se crea tras ejecutar el comando npx sequelize migration:create --name CreateUsersTable

//Y seran llamados bajo su orden de creacion con el comando definido en el package.json
//  -npm run migrate o npm run migrate_win (para Windows)

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      //Objetos del modelo: nombre de la tabla, atributos y tipos (excepto las validaciones)
      "Scores",
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
          unique: true,
        },
        wins: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        userId: {
          type: Sequelize.INTEGER,
          references: {
            model: "Users",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      },
      {
        sync: { force: true },
      }
    );
  },

  //Borra la tabla
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("Scores");
  },
};
