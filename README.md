# api-fantoir
API pour naviguer dans FANTOIR

## Prérequis

- Node.js version 16.13.0 ou supérieure
- MongoDB version 4.0 ou supérieure
- yarn

## Installation

```bash
# Installation des dépendances Node.js
$ yarn

# Chargement des données
$ yarn load-data
```

## Démarrer le serveur

```bash
yarn start
```

## API

### Lister les communes d'un département

`GET /departements/54/communes`

### Afficher les informations d'une commune

`GET /communes/54084`

### Lister les voies et les lieux-dits d'une commune

`GET /communes/54084/voies`

### Afficher les informations d'une voie ou d'un lieu-dit

`GET /communes/54084/voies/0100`
`GET /voies/54084-0100`
