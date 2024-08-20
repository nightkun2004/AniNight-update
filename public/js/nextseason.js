async function fetchAnimeData() {
    try {
        const response = await fetch('/api/v2/season/next?year=2024&month=ตุลาคม&season=Fall');
        const data = await response.json();
        console.log(data);

        displayAnimeData(data.animes);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function displayAnimeData(animes) {
    const animeList = document.getElementById('anime-list-nextseason');
    animeList.innerHTML = ''; // Clear any existing content
    animes.forEach(anime => {
        const animeCard = document.createElement('div');
        animeCard.className = 'anime-card bg-white shadow rounded w-[200px] h-[400px]';

        // const platforms = anime.platforms || []; 
        // const streamingHTML = platforms.map(platform => {
        //     const streamingLink = anime.streaming[0][platform];
        //     return streamingLink 
        //         ? `<a href="${streamingLink}" target="_blank">
        //               <img src="/logo/${platform}_icon.png" alt="${platform}" class="w-7 h-7 pointer-events-none rounded-full">
        //            </a>`
        //         : '';
        // }).join('');

        animeCard.innerHTML = `
            <picture class="relative">
                <a href="/anime/${anime.urlslug}">
                    <img width="400px" height="600px" src="/uploads/posters/${anime.poster}" alt="${anime.title}">
                </a>
                <span class="absolute top-0 left-0 bg-sky-400 rounded text-white px-3">${anime.year}</span>
               
            </picture>
            <div class="p-4">
                <h3 class="text-lg font-semibold">
                    <a href="/anime/${anime.urlslug}">
                        ${anime.title}
                    </a>
                </h3>
                <p class="text-gray-600 text-sm">
                    ${anime.voice} • ${anime.categories.join(', ')}
                </p>
            </div>
        `;

        animeList.appendChild(animeCard);
    });
}

// Call fetchAnimeData when the page loads
window.onload = fetchAnimeData;