module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Contacts", "jid", {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Contacts", "jid");
  }
};
