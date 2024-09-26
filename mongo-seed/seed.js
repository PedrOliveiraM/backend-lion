// Conexão com o banco de dados
db = db.getSiblingDB('mydatabase'); // Substitua pelo nome do seu banco de dados

// Inserindo e capturando usuários
const user1 = db.users.insertOne({
  email: 'user1@example.com',
  username: 'user1',
  password: 'Password1!',
});
const user2 = db.users.insertOne({
  email: 'user2@example.com',
  username: 'user2',
  password: 'Password2!',
});

// Inserindo e capturando empresas
const enterprise1 = db.enterprises.insertOne({
  name: 'Enterprise 1',
  region: 'Region 1',
  description: 'Description of Enterprise 1',
  userId: user1.insertedId, // Usando o ObjectId do usuário 1
});
const enterprise2 = db.enterprises.insertOne({
  name: 'Enterprise 2',
  region: 'Region 2',
  description: 'Description of Enterprise 2',
  userId: user2.insertedId, // Usando o ObjectId do usuário 2
});

// Inserindo e capturando projetos
const project1 = db.projects.insertOne({
  name: 'Project 1',
  address: 'Address 1',
  area: '150 sqm',
  enterprise_id: enterprise1.insertedId, // Usando o ObjectId da empresa 1
  image: 'image1.jpg',
  model: 'model1.obj',
});
const project2 = db.projects.insertOne({
  name: 'Project 2',
  address: 'Address 2',
  area: '250 sqm',
  enterprise_id: enterprise2.insertedId, // Usando o ObjectId da empresa 2
});

// Inserindo e capturando dependências
const dependency1 = db.dependencies.insertOne({
  name: 'Dependency 1',
  project_id: project1.insertedId, // Usando o ObjectId do projeto 1
});
const dependency2 = db.dependencies.insertOne({
  name: 'Dependency 2',
  project_id: project2.insertedId, // Usando o ObjectId do projeto 2
});

// Inserindo e capturando elementos
const element1 = db.elements.insertOne({
  name: 'Element 1',
  dependency_id: dependency1.insertedId, // Usando o ObjectId da dependência 1
});
const element2 = db.elements.insertOne({
  name: 'Element 2',
  dependency_id: dependency2.insertedId, // Usando o ObjectId da dependência 2
});

// Inserindo componentes
db.components.insertMany([
  {
    material: 'Steel',
    quantity: 100,
    energy_efficiency: 'A+',
    element_id: element1.insertedId, // Usando o ObjectId do elemento 1
  },
  {
    material: 'Concrete',
    quantity: 200,
    energy_efficiency: 'B',
    element_id: element2.insertedId, // Usando o ObjectId do elemento 2
  },
]);
