# Google Calendar Auto-Colorizer

![License MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Platform](https://img.shields.io/badge/Platform-Google%20Apps%20Script-green)
![Runtime](https://img.shields.io/badge/Google%20Apps%20Script-V8-green)
![Author](https://img.shields.io/badge/Auteur-Fabrice%20Faucheux-orange)

## Description
Ce projet Google Apps Script automatise la coloration des événements de votre agenda Google principal. Il permet de distinguer visuellement les réunions importantes en fonction des participants (Organisateur ou Invités VIP), facilitant ainsi la lecture de votre emploi du temps.

## Fonctionnalités clés
* **Priorisation hiérarchique :** Applique d'abord la couleur de l'organisateur. Si aucune règle ne correspond, cherche parmi les invités VIP.
* **Performance :** Utilise les méthodes de récupération par lots (`getEvents`) pour minimiser les appels API.
* **Sécurité :** Ne modifie la couleur que si nécessaire pour éviter les appels d'écriture superflus.
* **Robustesse :** Gestion d'erreurs granulaires (un événement défectueux ne plante pas tout le script).

## Installation manuelle

1.  Ouvrez [Google Apps Script](https://script.google.com/).
2.  Créez un nouveau projet nommé `Calendar-AutoColor`.
3.  Copiez le contenu du fichier `Code.js` fourni dans l'éditeur.
4.  Modifiez les constantes `COULEURS_PAR_ORGANISATEUR` et `COULEURS_PAR_INVITE` avec vos propres emails et préférences.
5.  Sauvegardez (`Ctrl + S`).

## Configuration du déclencheur (Trigger)

Pour que le script s'exécute automatiquement :

1.  Dans le menu de gauche, cliquez sur **Déclencheurs** (l'icône de réveil).
2.  Cliquez sur **Ajouter un déclencheur**.
3.  Configurez comme suit :
    * *Fonction à exécuter :* `colorerEvenementsPrincipal`
    * *Source de l'événement :* `Déclencheur temporel`
    * *Type de déclencheur :* `Déclencheur horaire`
    * *Fréquence :* `Toutes les heures` (ou selon votre besoin).
4.  Validez et acceptez les permissions Google.

## Stack technique
* Javascript (ES6+ V8 Runtime)
* Google CalendarApp Service
