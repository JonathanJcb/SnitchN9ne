const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(cors());

// Base de données en mémoire
let reports = [];
let filters = {
    yellow: [],
    orange: [],
    red: []
};

// Route pour recevoir les signalements
app.post('/api/report', (req, res) => {
    console.log("Requête de signalement reçue :", req.body);
    const { screenshot, url, category } = req.body;
    
    if (!screenshot || !url || !category) {
        console.log("Données manquantes dans le signalement.");
        return res.status(400).send({ message: 'Données manquantes' });
    }

    // Vérifier que la catégorie est valide
    const validCategories = ['harassment', 'racism', 'pornography'];
    if (!validCategories.includes(category)) {
        console.log("Catégorie invalide :", category);
        return res.status(400).send({ message: 'Catégorie invalide' });
    }

    const newReport = {
        id: reports.length + 1,
        screenshot,
        url,
        category, // Ajout de la catégorie
        status: 'pending' // pending, yellow, orange, red, rejected
    };

    reports.push(newReport);
    console.log("Nouveau signalement ajouté :", newReport);
    res.status(200).send({ message: 'Signalement reçu', report: newReport });
});

// Route pour récupérer tous les signalements, possibilité de filtrer par catégorie
app.get('/api/reports', (req, res) => {
    const category = req.query.category;
    if (category) {
        const filteredReports = reports.filter(r => r.category === category);
        console.log(`Signalements pour la catégorie ${category} :`, filteredReports);
        res.send(filteredReports);
    } else {
        console.log("Tous les signalements.");
        res.send(reports);
    }
});

// Route pour modérer un signalement
app.post('/api/moderate', (req, res) => {
    console.log("Requête de modération reçue :", req.body);
    const { id, status } = req.body;
    const report = reports.find(r => r.id === id);
    if (!report) {
        console.log("Signalement non trouvé pour l'ID :", id);
        return res.status(404).send({ message: 'Signalement non trouvé' });
    }
    
    const validStatuses = ['yellow', 'orange', 'red', 'rejected'];
    if (!validStatuses.includes(status)) {
        console.log("Statut invalide :", status);
        return res.status(400).send({ message: 'Statut invalide' });
    }

    report.status = status;
    if (status !== 'rejected') {
        if (!filters[status].includes(report.url)) {
            filters[status].push(report.url);
            console.log(`URL ajoutée au filtre ${status} :`, report.url);
        }
    }
    console.log("Signalement mis à jour :", report);
    res.status(200).send({ message: 'Signalement mis à jour', report });
});

// Route pour obtenir les URLs filtrées
app.post('/api/filter', (req, res) => {
    console.log("Requête de filtrage reçue :", req.body);
    const { color } = req.body;
    if (!['yellow', 'orange', 'red'].includes(color)) {
        console.log("Couleur invalide pour le filtrage :", color);
        return res.status(400).send({ message: 'Couleur invalide' });
    }
    console.log(`Envoi des URLs filtrées pour la couleur ${color} :`, filters[color]);
    res.send({ urls: filters[color] });
});

app.listen(PORT, () => {
    console.log(`Serveur backend SnitchNine en écoute sur le port ${PORT}`);
});
