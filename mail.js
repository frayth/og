const sgMail = require('@sendgrid/mail')
const {info} = require('./info');
sgMail.setApiKey('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')


// //type={
//   'reservation': envoie un mail au restaurateur pour lui dire qu'il y a une nouvelle reservation,
//   'confirmation': envoie un mail au client pour lui dire que sa reservation est confirmé
// }
 async function sendMail(data,type,status){
  let text=null;
  let destinataire=null;
  let subject=null;
  let html=null;
  switch(type){
    case 'reservation':
      destinataire=info.userMail;
      subject="Nouvelle réservation";
      text="Vous avez une nouvelle réservation";
      html=formatReservationMail(data);
      break;
    case 'confirmation':
      destinataire=data.mail;
      subject="Confirmation de réservation";
      text="Réponse à votre réservation";
      html=formatConfirmationMail(data,status);
      break;
      default:throw new Error('Type de mail inconnu');
  }

    const msg = {
      to: `${destinataire}`, // Change to your recipient
      from: `${info.sendGridMail}`, // Change to your verified sender
      subject: `${subject}`,
      text: `${text}`,
      html: `${html}`,
    }
   try{
    await sgMail.send(msg)
    return true;
   }catch(error){
    console.error(error)
     return false;
   }
}

function formatReservationMail(data){
  return `
  <h2>Vous avez une nouvelle réservation</h2>
  <p>Vous avez une reservation pour le ${data.date} de la part de ${data.lastname} ${data.firstname}</p>
  <p>Nombre de personne : ${data.people}</p>
  <p>Mail : ${data.mail}</p>
  <p>Téléphone : ${data.phone}</p>
  <a href='http://localhost:5678/validation?token=${data.token}'><button>Confirmer</button></a>
  <a href='http://localhost:5678/refus?token=${data.token}'><button>Refuser</button></a>
  `
}

function formatConfirmationMail(data,accepted){
  return `
  <p>Bonjour ${data.lastname} ${data.firstname}</p>
  <p>Vous avez demandé une réservation pour le ${formatDate(data.reservationDate)} pour ${data.numberOfPeople} personne${data.numberOfPeople>1?'s':''}</p>
  <p>${accepted?'Nous avons le plaisir de vous annocer que votre reservation à été accepté!':'Nous avons le regret de vous informer que nous ne pourrons pas vous recevoir a cette date!'}</p>
  `
}

function formatDate(timestamp){
  const date = new Date(timestamp);
  let jour = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'],
  mois = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novenbre','Décembre'];
  const dayName = jour[date.getDay()];
  const day = date.getDate();
  const month = mois[date.getMonth()];
  const year = date.getFullYear();
  return `${dayName} ${day} ${month} ${year}`;
}



  exports.sendMail = sendMail;