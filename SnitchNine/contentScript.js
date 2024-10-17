(() => {
  // Fonction pour envoyer un signalement
  function sendReport() {
    const screenshot = document.getElementById('screenshot').files[0];
    const tweetLink = document.getElementById('tweet-link').value;
    const category = document.querySelector('input[name="category"]:checked').value;

    if (!screenshot || !tweetLink || !category) {
        alert("Veuillez remplir tous les champs.");
        return;
    }

    // Envoi des données à l'API
    const formData = new FormData();chrome.storage.sync.get('filterColor', function(data) {
      if (data.filterColor && data.filterColor !== 'all') {
        applyFilter(data.filterColor);
      }
    });
    
    function applyFilter(color) {
      const tweets = document.querySelectorAll('.tweet');
      tweets.forEach(tweet => {
        const tweetColor = tweet.getAttribute('data-filter-color');
        if (color === 'all' || tweetColor === color) {
          tweet.style.display = 'none';
        }
      });
    }
    
    formData.append("screenshot", screenshot);
    formData.append("tweetLink", tweetLink);
    formData.append("category", category);

    fetch("https://api.snitchnine.com/report", {
        method: "POST",
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Signalement envoyé avec succès !");
        } else {
            alert("Erreur lors de l'envoi du signalement.");
        }
    })
    .catch(error => {
        console.error("Erreur:", error);
    });
  }

// Fonction pour appliquer un filtre de couleur
  function applyColorFilter(color) {
    const tweets = document.querySelectorAll(".tweet");
    tweets.forEach(tweet => {
        const tweetId = tweet.getAttribute('data-tweet-id'); // Assurez-vous que chaque tweet a un ID unique
        const filteredColor = getFilteredColor(tweetId); // Une fonction qui récupère la couleur assignée au tweet
        if (filteredColor === color) {
            tweet.style.display = "none";
        }
    });

    alert(`Filtre appliqué : ${color}`);
  }

// Exemple de fonction qui récupère la couleur assignée au tweet
  function getFilteredColor(tweetId) {
    // Simulation de récupération de la couleur assignée depuis l'API ou localStorage
    // Vous devrez intégrer ça avec l'API de votre modération
    return localStorage.getItem(`color_${tweetId}`);
  }

// Modifie l'affichage du tweet lorsque le filtre est appliqué
  function hideTweet(tweetId) {
    const tweet = document.querySelector(`[data-tweet-id="${tweetId}"]`);
    if (tweet) {
        tweet.style.display = 'none';
    }
  }

// Fonction pour empêcher l'accès aux tweets signalés
  function blockTweetLink(event) {
    const tweetUrl = event.target.href;

    // Vérifiez si le lien du tweet est signalé
    if (isTweetBlocked(tweetUrl)) {
        event.preventDefault();
        alert("Erreur SnitchNine : Ce tweet a été signalé et bloqué.");
    }
  }

// Fonction pour vérifier si un tweet est bloqué
  function isTweetBlocked(tweetUrl) {
    const blockedTweets = JSON.parse(localStorage.getItem('blockedTweets')) || [];
    return blockedTweets.includes(tweetUrl);
  }

  // Attacher cette fonction à tous les liens de tweets
  document.querySelectorAll('a[href*="twitter.com"]').forEach(link => {
    link.addEventListener('click', blockTweetLink);
  });

})();
