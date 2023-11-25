const express = require('express');
const { sequelize,reservation,findUserByEmail} = require('./db');
const {sendMail} = require('./mail');
const app = express()

app.use(express.json())

async function test(){
  console.log("test")
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}
test()


  app.post('/test', async (req, res) => {
    try {
      // Récupérer les données de la requête POST
      let {firstname,lastname,date,phone,mail,people}= req.body;
      //genere un token aleatoir de 20 charactere avec des symbole et des lettre 
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)+ Math.random().toString(36).substring(2, 15);
      const user = await findUserByEmail(mail);
      if(user.exists){
        res.status(409).json({ message: 'Utilisateur déjà existant' });
        return;
      }
      const nouvelUtilisateur = await reservation.create({firstname,lastname,phone,mail,token,numberOfPeople:people,reservationDate:Date.now()});
      if(!nouvelUtilisateur){
        res.status(500).json({ message: 'Erreur lors de l\'ajout de l\'utilisateur' });
        return;
      }
      await sendMail({firstname,lastname,date,phone,mail,token,people},'reservation');

      res.status(201).json({
        id: nouvelUtilisateur.id,
        utilisateur: nouvelUtilisateur,
      });
    } catch (error) {
      // Gérer les erreurs
      console.error(error);
      res.status(500).json({ message: 'Erreur lors de l\'ajout de l\'utilisateur' });
    }
  });

  app.get('/validation', async (req, res) => {
    const token = req.query.token;
    const user = await reservation.findOne({ where: { token:token } });
    if(!user){
      res.status(404).json({ message: 'Utilisateur non trouvé, cela signifie que vous avez deja accepté ou refusé cette demande de reservation' });
      return;
    }
    const response=await sendMail(user.dataValues,'confirmation',true);
    if(!response){
      res.status(500).json({ message: 'Erreur lors de l\'envoi du mail' });
      return;
    }
    await user.destroy();
    res.status(200).json({ message: 'Un Mail de confirmation a bien été envoyé au client!' });

  });
  app.get('/refus', async (req, res) => {
    const token = req.query.token;
    const user = await reservation.findOne({ where: { token:token } });
    if(!user){
      res.status(404).json({ message: 'Utilisateur non trouvé, cela signifie que vous avez deja accepté ou refusé cette demande de reservation' });
      return;
    }
    const response=await sendMail(user.dataValues,'confirmation',false);
    if(!response){
      res.status(500).json({ message: 'Erreur lors de l\'envoi du mail' });
      return;
    }
    await user.destroy();
    res.status(200).json({ message: 'Un Mail de refus a bien été envoyé au client!' });
  });

module.exports = app;
