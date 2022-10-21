# api-fantoir
API pour naviguer dans FANTOIR

## Prérequis

- Node.js version 16.13.0 ou supérieure
- MongoDB version 4.0 ou supérieure
- yarn

## Installation des dépendances

```bash
yarn
```

## Configuration

Ce dépôt fonctionne avec une configuration par défaut. Il est néanmoins possible de modifier la configuration en changeant les variables d’environnements.

Le fichier `.env.sample` est présent à des fins d’exemple pour créer un fichier `.env`.
Toutes les variables sont optionnelles.

| Nom de la variable | Description | Valeur par défaut |
| --- | --- | --- |
| `MONGODB_URL` | Chemin de connexion à la base MongoDB | `mongodb://localhost` |
| `MONGODB_DBNAME` | Nom de la base de données MongoDB | `api-fantoir` |
| `TERRITOIRES` | Liste séparée par des virgules des territoires à prendre en compte (communes ou départements) | (vide) |
| `FANTOIR_PATH` | Chemin d’accès au fichier FANTOIR à importer. Peut-être une URL ou un chemin local | `https://adresse.data.gouv.fr/data/fantoir/latest` |

## Chargement des données

```bash
yarn load-data
```

## Démarrer le serveur

```bash
yarn start
```

## API

### Lister les communes d'un département

`GET /departements/54/communes`

Exemple : https://plateforme.adresse.data.gouv.fr/api-fantoir/departements/54/communes

### Afficher les informations d'une commune

`GET /communes/54084`

Exemple : https://plateforme.adresse.data.gouv.fr/api-fantoir/communes/54084

### Lister les voies et les lieux-dits d'une commune

`GET /communes/54084/voies`
`GET /communes/54084/voies.csv`

Exemple : https://plateforme.adresse.data.gouv.fr/api-fantoir/communes/54084/voies

### Afficher les informations d'une voie ou d'un lieu-dit

`GET /communes/54084/voies/0100`

Exemple : https://plateforme.adresse.data.gouv.fr/api-fantoir/communes/54084/voies/0100

`GET /voies/54084-0100`

Exemple : https://plateforme.adresse.data.gouv.fr/api-fantoir/voies/54084-0100

## Scrapping

Merci de ne pas scrapper l'instance de production. Ce sont des données publiques accessibles à tous sur [data.gouv.fr](https://www.data.gouv.fr/fr/datasets/fichier-fantoir-des-voies-et-lieux-dits/).
