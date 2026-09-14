'use strict';
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('customers', [
      {
        id: uuidv4(),
        name:'Ana da Silva', 
        cpf: '46705987495', 
        email: 'ana.silva@email.com', 
        phone: '011955443322', 
        zipcode: '01252989', 
        address: 'Rua ABCD', 
        residence_number: '18', 
        neighborhood: 'Consoantes', 
        city: 'São Paulo', 
        state: 'São Paulo', 
        uf: 'SP',
        createdAt: new Date(),
        updatedAt: new Date()

      },
      {
        id: uuidv4(),
        name:'Carlos Oliveira dos Santos', 
        cpf: '25497651269', 
        email: 'carlos.santos@email.com', 
        phone: '011955443322', 
        zipcode: '01252989', 
        address: 'Rua AAEEII', 
        residence_number: '18', 
        neighborhood: 'Vogais', 
        city: 'Rio de Janeiro', 
        state: 'Rio de Janeiro', 
        uf: 'RJ',
        createdAt: new Date(),
        updatedAt: new Date()

      },
      {
        id: uuidv4(),
        name:'Ana Assunção Fernandes', 
        cpf: '46705954321', 
        email: 'ana.fernandes@email.com', 
        phone: '011922334455', 
        zipcode: '01252989', 
        address: 'Rua BCDFGH', 
        residence_number: '', 
        neighborhood: 'Limeira', 
        city: 'Rio de Janeiro', 
        state: 'Rio de Janeiro', 
        uf: 'RJ',
        createdAt: new Date(),
        updatedAt: new Date()

      },
      {
        id: uuidv4(),
        name:'Marcelo de Souza', 
        cpf: '87634155872', 
        email: 'marcelo.souza@email.com', 
        phone: '011959874521', 
        zipcode: '06578102', 
        address: 'Rua ZYXACS', 
        residence_number: '04', 
        neighborhood: 'Liberdade', 
        city: 'São Paulo', 
        state: 'São Paulo', 
        uf: 'SP',
        createdAt: new Date(),
        updatedAt: new Date()

      },
      {
        id: uuidv4(),
        name:'Claudia Lima dos Santos', 
        cpf: '55587412631', 
        email: 'claudia.santos@email.com', 
        phone: '011946549873', 
        zipcode: '06896185', 
        address: 'Avenida ABCDEDFG', 
        residence_number: '1442', 
        neighborhood: 'Botânico', 
        city: 'São Paulo', 
        state: 'São Paulo', 
        uf: 'SP',
        createdAt: new Date(),
        updatedAt: new Date()

      },
      
    ])
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('customers', null, {});
  }
};
