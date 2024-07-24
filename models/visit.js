const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "visits",
    {
      visitingID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      wisataID: {
        type: DataTypes.INTEGER, // Ganti dengan INTEGER agar konsisten
        allowNull: false,
        references: {
          model: "contents",
          key: "wisataID",
        },
      },
      listVisitor: {
        type: DataTypes.JSON, // Gunakan JSON untuk menyimpan array
        allowNull: false,
      },
      visitDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "visits",
    }
  );
};
