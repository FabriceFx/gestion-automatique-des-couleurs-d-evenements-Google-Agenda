/**
 * @license MIT
 * Copyright (c) 2025 Fabrice Faucheux
 * * @fileoverview Script de gestion automatique des couleurs d'événements Google Agenda
 * basé sur l'identité de l'organisateur ou des invités présents.
 */

/**
 * @OnlyCurrentDoc
 */

// ==================================================================
// CONFIGURATION
// ==================================================================

/**
 * Règles de coloration prioritaires basées sur l'email de l'ORGANISATEUR.
 * @constant {Object.<string, GoogleAppsScript.Calendar.EventColor>}
 */
const COULEURS_PAR_ORGANISATEUR = {
  'manager@entreprise.com': CalendarApp.EventColor.RED,
  'admin-support@entreprise.com': CalendarApp.EventColor.GRAY
};

/**
 * Règles de coloration secondaires basées sur l'email des INVITÉS.
 * @constant {Object.<string, GoogleAppsScript.Calendar.EventColor>}
 */
const COULEURS_PAR_INVITE = {
  'client-important@exemple.com': CalendarApp.EventColor.ORANGE,
  'partenaire-strategique@exemple.com': CalendarApp.EventColor.MAUVE,
  'contact-presse@exemple.com': CalendarApp.EventColor.YELLOW
};

/**
 * Nombre de jours à scanner dans le futur.
 * @constant {number}
 */
const JOURS_A_SCANNER = 30;

// ==================================================================
// LOGIQUE MÉTIER
// ==================================================================

/**
 * Calcule une date future basée sur la date actuelle.
 * * @param {number} joursAjoutes - Le nombre de jours à ajouter à la date courante.
 * @return {Date} L'objet Date calculé.
 */
const obtenirDateFuture = (joursAjoutes) => {
  const date = new Date();
  date.setDate(date.getDate() + joursAjoutes);
  return date;
};

/**
 * Recherche une règle de couleur applicable pour un groupe de participants donné.
 * * @param {GoogleAppsScript.Calendar.CalendarEventGuest[]} listeInvites - Liste des invités de l'événement.
 * @param {Object} reglesCouleur - L'objet de configuration (Dictionnaire Email -> Couleur).
 * @param {boolean} [doitEtreOrganisateur=false] - Si true, ne filtre que l'organisateur. Sinon les invités.
 * @return {{couleur: string, email: string} | null} La règle trouvée ou null.
 */
const trouverRegle = (listeInvites, reglesCouleur, doitEtreOrganisateur = false) => {
  // Utilisation de .find() pour une itération efficace
  const participantCible = listeInvites.find(invite => {
    const email = invite.getEmail().toLowerCase();
    const estEligible = invite.isOrganizer() === doitEtreOrganisateur;
    // Vérifie si l'email existe dans les clés de l'objet de règles
    return estEligible && Object.prototype.hasOwnProperty.call(reglesCouleur, email);
  });

  if (!participantCible) return null;

  const emailCible = participantCible.getEmail().toLowerCase();
  return {
    couleur: reglesCouleur[emailCible],
    email: emailCible
  };
};

/**
 * Applique la logique de coloration sur un événement unique.
 * Gestion des erreurs isolée pour ne pas bloquer la boucle principale.
 * * @param {GoogleAppsScript.Calendar.CalendarEvent} evenement - L'événement à traiter.
 */
const traiterEvenement = (evenement) => {
  try {
    const idEvenement = evenement.getId();
    const titre = evenement.getTitle();
    const couleurActuelle = evenement.getColor();
    
    // Récupération complète (incluant le propriétaire)
    const listeInvites = evenement.getGuestList(true); 

    if (!listeInvites || listeInvites.length === 0) return;

    let resultatRegle = null;

    // Étape 1 : Vérification Prioritaire (Organisateur)
    resultatRegle = trouverRegle(listeInvites, COULEURS_PAR_ORGANISATEUR, true);

    // Étape 2 : Vérification Secondaire (Invités VIP) si aucune règle organisateur
    if (!resultatRegle) {
      resultatRegle = trouverRegle(listeInvites, COULEURS_PAR_INVITE, false);
    }

    // Application si une règle est trouvée et que la couleur diffère
    if (resultatRegle) {
      const { couleur, email } = resultatRegle;
      
      if (couleur !== couleurActuelle) {
        evenement.setColor(couleur);
        console.info(`[SUCCÈS] Événement "${titre}" coloré. Règle: ${email}`);
      }
    }

  } catch (erreur) {
    console.error(`[ERREUR] Échec sur l'événement "${evenement.getTitle()}" : ${erreur.message}`);
  }
};

/**
 * Fonction Principale.
 * Point d'entrée du script à déclencher manuellement ou via trigger.
 */
function colorerEvenementsPrincipal() {
  console.time('ExecutionScript'); // Mesure de performance
  try {
    const calendrier = CalendarApp.getDefaultCalendar();
    if (!calendrier) throw new Error("Accès au calendrier par défaut impossible.");

    const dateDebut = new Date();
    const dateFin = obtenirDateFuture(JOURS_A_SCANNER);

    console.info(`Démarrage du scan : ${dateDebut.toLocaleDateString()} au ${dateFin.toLocaleDateString()}`);

    // Récupération par lot (Batch operation)
    const evenements = calendrier.getEvents(dateDebut, dateFin);
    
    if (evenements.length === 0) {
      console.warn("Aucun événement trouvé dans la plage donnée.");
      return;
    }

    console.info(`${evenements.length} événement(s) récupéré(s). Traitement en cours...`);

    // Traitement itératif
    evenements.forEach(traiterEvenement);

  } catch (erreur) {
    console.error(`[CRITIQUE] Arrêt du script : ${erreur.message}`);
    console.error(erreur.stack);
  } finally {
    console.timeEnd('ExecutionScript');
  }
}
