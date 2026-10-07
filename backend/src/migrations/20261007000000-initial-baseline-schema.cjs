'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Check if Users table already exists before creating (idempotent baseline check)
    const tables = await queryInterface.showAllTables();
    const hasUsers = tables.includes('Users') || tables.includes('users');
    
    if (!hasUsers) {
      await queryInterface.createTable('Users', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: Sequelize.STRING, allowNull: false },
        email: { type: Sequelize.STRING, allowNull: false, unique: true },
        password: { type: Sequelize.STRING, allowNull: false },
        role: { type: Sequelize.ENUM('student', 'recruiter', 'admin'), allowNull: false },
        branch: Sequelize.STRING,
        cgpa: Sequelize.FLOAT,
        skills: { type: Sequelize.ARRAY(Sequelize.STRING), defaultValue: [] },
        resumeURL: Sequelize.STRING,
        companyName: Sequelize.STRING,
        approved: { type: Sequelize.BOOLEAN, defaultValue: false },
        createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
        updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
      });
    }
  },

  async down (queryInterface, Sequelize) {
    // Safe rollback in test/dev environments
    const tables = await queryInterface.showAllTables();
    if (tables.includes('Users')) {
      await queryInterface.dropTable('Users');
    }
  }
};
