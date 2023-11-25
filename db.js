const { Sequelize,DataTypes } = require('sequelize');
console.log("test")
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'mydatabase.db', // Remplacez par le nom de votre fichier de base de données SQLite
});
const reservation = sequelize.define('Reservation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  firstname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  mail: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  token: {
    type: DataTypes.STRING,
  },
  numberOfPeople: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  reservationDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});
setInterval(async function(){
  const users = await reservation.findAll();
  for(let i=0;i<users.length;i++){
    if(users[i].reservationDate<Date.now()){
      await users[i].destroy();
    }
  }
},1000*60*3)
async function syncDatabase() {
  try {
    await sequelize.sync(); // Use { force: true } to drop the existing table (if any) and recreate
    console.log('Table created successfully');
  } catch (error) {
    console.error('Error syncing database:', error);
  }
}
async function findUserByEmail(email) {
  console.log(email)
  try {
    const user = await reservation.findOne({ where: { mail:email } });
    if (user) {
      return {exists: true, user}
    } else {
      return {exists: false, user: null}
    }
  } catch (error) {
    console.error('Error finding user by email:', error);
  }
}

syncDatabase();
exports.reservation = reservation;
exports.sequelize = sequelize;
exports.findUserByEmail = findUserByEmail;
