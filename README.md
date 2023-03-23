# api-fantoir
API pour naviguer dans FANTOIR

## Utilisation sans Docker

### Prérequis 

- Node.js version 16.13.0 ou supérieure
- MongoDB version 4.0 ou supérieure
- yarn

### Installation des dépendances

```bash
yarn
```

### Chargement des données

```bash
yarn load-data
```

### Démarrer le serveur

```bash
yarn start
```

## Utilisation avec Docker

### Prérequis 

- Docker version 20.0.0
- Docker Compose version 2.0.0

### Démarrer l'environnement de developpement

```bash
docker-compose up --build -d
```

### Chargement des données

Pour charger les données, il y a deux possibilités : 

1. Chargement à la demande

Dans le client du conteneur de l'api, entrer la commande : 

```bash
yarn load-data
```

2. Chargement à chaque lancement du conteneur de l'api

Dans le fichier start.dev.sh, ajouter (ou décommenter la ligne concernée) la commande : 

```bash
yarn load-data
```

Attention, le chargement des données peut prendre du temps et il est donc préférable d'utiliser le chargement "à la demande" à la première initialisation des conteneurs. Comme les données sont persistantes (volume 'db'), les données n'auront pas à être chargées à chaque fois.

## Configuration (avec et sans Docker)

Ce dépôt fonctionne avec une configuration par défaut. Il est néanmoins possible de modifier la configuration en changeant les variables d’environnements.

Le fichier `.env.sample` est présent à des fins d’exemple pour créer un fichier `.env`.
Toutes les variables sont optionnelles.

| Nom de la variable | Description | Valeur par défaut | Commentaire |
| --- | --- | --- | --- |
| `MONGODB_URL` | Chemin de connexion à la base MongoDB | `mongodb://localhost` | Cette variable n'est pas utilisée pour le deploiement Docker en local car elle est surchargée dans le docker-compose |
| `MONGODB_PORT` | Port du conteneur Docker MongoDB |  | Cette variable est seulement utilisée pour le déploiement Docker en local |
| `MONGODB_DBNAME` | Nom de la base de données MongoDB | `api-fantoir` | |
| `TERRITOIRES` | Liste séparée par des virgules des territoires à prendre en compte (communes ou départements) | | |
| `FANTOIR_PATH` | Chemin d’accès au fichier FANTOIR à importer. Peut-être une URL ou un chemin local | `https://adresse.data.gouv.fr/data/fantoir/latest` | |
| `PORT` | Port d'écoute de l'API | `5000` | En deploiement sans Docker, la variable surcharge le port d'écoute de l'API. En deploiement avec Docker, la variable surcharge le port externe du conteneur (qui sera mappé au port interne '5000' du conteneur) |
| `FORCE_LOAD_FANTOIR_DATA` | Variable permettant d'importer les données FANTOIR dans le conteneur Docker MongoDB | | Cette variable est seulement utilisée pour le déploiement Docker en local |

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
