document.addEventListener('DOMContentLoaded', function() {
  const submitReportButton = document.getElementById('submitReport');
  const applyFilterButton = document.getElementById('applyFilter');
  const errorMessage = document.getElementById('error-message');
  const successMessage = document.getElementById('success-message');
  const filterPopup = document.getElementById('filter-popup');
  const filterColorSpan = document.getElementById('filter-color');

  // Fonction pour envoyer un signalement
  submitReportButton.addEventListener('click', async () => {
      const fileInput = document.getElementById('screenshotInput');
      const urlInput = document.getElementById('urlInput').value.trim();
      const categoryInput = document.getElementById('categoryInput').value;

      if (fileInput.files.length === 0 || !urlInput || !categoryInput) {
          showError("Veuillez ajouter une capture d'écran, un lien et sélectionner une catégorie.");
          return;
      }

      const file = fileInput.files[0];
      const reader = new FileReader();

      reader.onloadend = async () => {
          const imageData = reader.result;

          try {
              const response = await fetch('http://localhost:3000/api/report', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                      screenshot: imageData,
                      url: urlInput,
                      category: categoryInput
                  })
              });

              const data = await response.json();
              if (response.ok && data.message === 'Signalement reçu') {
                  showSuccess("Signalement envoyé avec succès !");
                  resetForm();
              } else {
                  showError("Erreur lors de l'envoi du signalement : " + (data.message || "Inconnue"));
              }
          } catch (error) {
              console.error("Erreur de connexion au serveur :", error);
              showError("Erreur de connexion au serveur.");
          }
      };

      reader.readAsDataURL(file);
  });

  // Fonction pour appliquer un filtre
  applyFilterButton.addEventListener('click', () => {
      const selectedColor = document.getElementById('colorFilter').value;
      chrome.storage.sync.set({ filterColor: selectedColor }, () => {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
              chrome.scripting.executeScript({
                  target: { tabId: tabs[0].id },
                  function: applyColorFilter,
                  args: [selectedColor]
              });
          });
          // Envoyer un message au background.js pour notifier que le filtre a été appliqué
          if (selectedColor !== 'all') {
              chrome.runtime.sendMessage({ type: 'FILTER_APPLIED', color: selectedColor });
              showFilterPopup(selectedColor);
          } else {
              // Si "Tous" est sélectionné, enlever les pastilles
              chrome.runtime.sendMessage({ type: 'FILTER_REMOVED' });
              hideFilterPopup();
          }
      });
  });

  // Fonction pour afficher un message d'erreur
  function showError(message) {
      errorMessage.textContent = message;
      errorMessage.style.display = 'block';
      successMessage.style.display = 'none';
  }

  // Fonction pour afficher un message de succès
  function showSuccess(message) {
      successMessage.textContent = message;
      successMessage.style.display = 'block';
      errorMessage.style.display = 'none';
  }

  // Fonction pour réinitialiser le formulaire
  function resetForm() {
      document.getElementById('screenshotInput').value = '';
      document.getElementById('urlInput').value = '';
      document.getElementById('categoryInput').value = '';
  }

  // Fonction pour afficher le popup de filtre appliqué
  function showFilterPopup(color) {
      filterColorSpan.textContent = capitalizeFirstLetter(color);
      filterPopup.style.display = 'block';
      setTimeout(() => {
          filterPopup.style.display = 'none';
      }, 3000);
  }

  // Fonction pour cacher le popup de filtre
  function hideFilterPopup() {
      filterPopup.style.display = 'none';
  }

  // Fonction pour capitaliser la première lettre
  function capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
  }

  // Fonction à injecter dans la page pour appliquer le filtre
  function applyColorFilter(selectedColor) {
      // Rien ici car le filtrage est géré par contentScript.js
      // Cette fonction peut être utilisée pour des actions supplémentaires si nécessaire
  }
});
