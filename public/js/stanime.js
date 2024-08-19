document.addEventListener("DOMContentLoaded", function() {
    const filterButtons = document.querySelectorAll(".filter-btn");
    const animeCards = document.querySelectorAll(".anime-card");
    const selectedFiltersElement = document.getElementById("selected-filters");
    const searchInput = document.getElementById("search-input");
    let selectedFilters = {
        animetype: "all",
        categories: "ทั้งหมด",
        voice: "ทั้งหมด",
        price: "all",
        season: "all",
        year: "all",
        month: "all",
        status: "all",
        platform: "all" ,
        search: ""
    };

    function updateSelectedFiltersText() {
        const selectedText = Object.values(selectedFilters).join(', ');
        selectedFiltersElement.textContent = selectedText === 'all, ทั้งหมด, ทั้งหมด, all, all, all, all, all, all' ? 'ทั้งหมด' : selectedText;
    }

    function updateActiveButton(filterType, selectedValue) {
        filterButtons.forEach(button => {
            const buttonValue = button.getAttribute(`data-${filterType}`);

            if (buttonValue === selectedValue) {
                button.classList.remove('bg-gray-200', 'text-gray-600');
                button.classList.add('bg-blue-200', 'text-blue-600');
            } else {
                button.classList.remove('bg-blue-200', 'text-blue-600');
                button.classList.add('bg-gray-200', 'text-gray-600');
            }
        });
    }

    filterButtons.forEach(button => {
        button.addEventListener("click", function() {
            const filterType = this.getAttribute("data-animetype") ? "animetype" :
                              this.getAttribute("data-style") ? "style" :
                              this.getAttribute("data-voice") ? "voice" :
                              this.getAttribute("data-price") ? "price" :
                              this.getAttribute("data-season") ? "season" :
                              this.getAttribute("data-year") ? "year" :
                              this.getAttribute("data-month") ? "month" :
                              this.getAttribute("data-status") ? "status" :
                              this.getAttribute("data-platform") ? "platform" : null;

            if (filterType) {
                const selectedValue = this.getAttribute(`data-${filterType}`);
                selectedFilters[filterType] = selectedValue;
                updateSelectedFiltersText();
                updateActiveButton(filterType, selectedValue);
                filterAnimes();
            }
        });
    });

    searchInput.addEventListener("input", function () {
        selectedFilters.search = this.value.toLowerCase();
        filterAnimes();
    });
    
    function filterAnimes() {
        animeCards.forEach(card => {
            const animetype = card.getAttribute("data-category");
            const style = card.getAttribute("data-categories");
            const voice = card.getAttribute("data-voice");
            const price = card.getAttribute("data-price");
            const season = card.getAttribute("data-season");
            const year = card.getAttribute("data-year");
            const month = card.getAttribute("data-month");
            const status = card.getAttribute("data-status");
            const platforms = JSON.parse(card.getAttribute("data-platforms") || '[]'); 
            const title = card.querySelector("h3").textContent.toLowerCase();

            const matchesAnimetype = selectedFilters.animetype === "all" || selectedFilters.animetype === animetype;
            const matchesStyle = selectedFilters.categories === "ทั้งหมด" || selectedFilters.categories === style;
            const matchesVoice = selectedFilters.voice === "ทั้งหมด" || selectedFilters.voice === voice;
            const matchesPrice = selectedFilters.price === "all" || selectedFilters.price === price;
            const matchesSeason = selectedFilters.season === "all" || selectedFilters.season === season;
            const matchesYear = selectedFilters.year === "all" || selectedFilters.year === year;
            const matchesMonth = selectedFilters.month === "all" || selectedFilters.month === month;
            const matchesStatus = selectedFilters.status === "all" || selectedFilters.status === status;
            const matchesPlatform = selectedFilters.platform === "all" || platforms.includes(selectedFilters.platform);
            const matchesSearch = selectedFilters.search === "" || title.includes(selectedFilters.search);

            if (matchesAnimetype && matchesStyle && matchesVoice && matchesPrice && matchesSeason && matchesYear && matchesMonth && matchesStatus && matchesPlatform && matchesSearch) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }
        });
    }

    filterAnimes();
});