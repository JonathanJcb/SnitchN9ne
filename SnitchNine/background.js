chrome.runtime.onInstalled.addListener(() => {
  console.log("SnitchNine installé");
});

// Écoute les messages pour afficher des notifications
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'FILTER_APPLIED') {
      chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon48.png', // Utilise l'icône originale
          title: 'SnitchNine',
          message: `Filtre appliqué : ${capitalizeFirstLetter(request.color)}`,
          priority: 1
      });
  } else if (request.type === 'FILTER_REMOVED') {
      chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: 'SnitchNine',
          message: `Tous les filtres ont été retirés.`,
          priority: 1
      });
  }
});

// Fonction pour capitaliser la première lettre d'une chaîne
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
