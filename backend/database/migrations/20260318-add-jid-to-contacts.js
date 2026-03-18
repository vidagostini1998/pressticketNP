module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("Contacts", "jid", {
      type: Sequelize.STRING,
      unique: true,
      allowNull: true
    });
  },
  down: queryInterface => {
    return queryInterface.removeColumn("Contacts", "jid");
  }
};
