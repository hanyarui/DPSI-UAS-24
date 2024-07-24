const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "favorites",
    {
      favoriteID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: "users",
          key: "email",
        },
      },
      wisataID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "contents",
          key: "wisataID",
        },
      },
      isFavorite: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "favorites",
    }
  );
};
