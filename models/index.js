require("dotenv").config();
const { Sequelize, DataTypes } = require("sequelize");
const mysql2 = require("mysql2");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    dialectModule: mysql2,
    dialectOptions: {
      ssl: {
        require: process.env.DB_SSL === "REQUIRED",
        rejectUnauthorized: false,
      },
    },
  }
);

const Contents = require("./content")(sequelize, DataTypes);
const Users = require("./user")(sequelize, DataTypes);
const Favorites = require("./favorite")(sequelize, DataTypes);
const Visits = require("./visit")(sequelize, DataTypes);

// Define associations
Users.belongsTo(Contents, {
  foreignKey: {
    name: "wisataName",
    allowNull: true,
    references: {
      model: Contents,
      key: "wisataName",
    },
  },
  targetKey: "wisataName",
});

Favorites.belongsTo(Contents, {
  foreignKey: {
    name: "wisataID",
    allowNull: false,
    references: {
      model: Contents,
      key: "wisataID",
    },
  },
  targetKey: "wisataID",
});

Favorites.belongsTo(Users, {
  foreignKey: {
    name: "email",
    allowNull: false,
    references: {
      model: Users,
      key: "email",
    },
  },
  targetKey: "email",
});

Visits.belongsTo(Contents, {
  foreignKey: {
    name: "wisataID",
    allowNull: false,
    references: {
      model: Contents,
      key: "wisataID",
    },
  },
  targetKey: "wisataID",
});

// New function to sync database
async function syncDatabase() {
  try {
    await sequelize.authenticate();
    console.log("Connection established successfully.");

    // Then synchronize all models
    await sequelize.sync({ alter: true });

    console.log("Database synchronized successfully");
  } catch (error) {
    console.error("Error synchronizing database:", error);
  }
}

// Call the function to sync the database
syncDatabase();

module.exports = {
  sequelize,
  Users,
  Contents,
  Favorites,
  Visits,
  syncDatabase,
};
