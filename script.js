const state = {
    movies: [],
    currentPage: 1,
    totalPages: 1,
    category: "popular",
    likedMovies: [],
    tab: "home",
};

const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhYjVlODViNGVmYTBiZmYzMTRkMGFiYmNmMTJlNDEyMCIsInN1YiI6IjY0NzE4ODI4OTQwOGVjMDExZjJiM2ZlMyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.4zth2nW36LlXaS7OMcUjnTEdZbeozHqY5W1fcEDKFiI'
    }
};

const poster_path_prefix = 'https://image.tmdb.org/t/p/w500';

window.addEventListener('DOMContentLoaded', () => {
    loadMoviesData();
    clickLiked();
});

/**
 * choose tab
 */
function openTab(tabId) {
    state.tab = tabId;
    const tabs = document.getElementsByClassName('tab-content');

    for (let i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('active');
    }

    const buttons = document.getElementsByClassName('tab-button');
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove('active');
    }

    document.getElementById(tabId).classList.add('active');
    document.getElementById('button-' + tabId).classList.add('active');
    renderView();
}

/**
 * choose category
 */

// The app should load the "Popular" movies by default.
const categoriesSelect = document.getElementById('categories');

categoriesSelect.addEventListener("change", function() {
    state.category = categoriesSelect.value;
    state.currentPage = 1;
    loadMoviesData();
});

/**
 *  pagination
 */
const prevButton = document.getElementById("prev");
const nextButton = document.getElementById("next");
prevButton.addEventListener("click", function() {
    if (state.currentPage - 1 >= 1) {
        state.currentPage -= 1;
        loadMoviesData();
    }
});

nextButton.addEventListener("click", function() {
    if (state.currentPage + 1 <= state.totalPages) {
        state.currentPage += 1;
        loadMoviesData();
    }
    
});

function loadMoviesData() {
    let url;
    if (state.tab === "home" && state.category === "popular") {
        url = `https://api.themoviedb.org/3/movie/popular?language=en-US&page=${state.currentPage}`;
    } else if (state.tab === "home" && state.category === "now-playing") {
        url = `https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=${state.currentPage}`;
    } else if (state.tab === "home" && state.category === "top-rated") {
        url = `https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=${state.currentPage}`;
    } else if (state.tab === "home" && state.category === "up-coming") {
        url = `https://api.themoviedb.org/3/movie/upcoming?language=en-US&page=${state.currentPage}`;
    }

    fetch(url, options)
        .then((resp) => {
            return resp.json();
        })
        .then((data) => {
            state.movies = data.results;
            state.totalPages = data.total_pages;
            renderView();
        })
        .catch((err) => {
            console.error(err);
        });
}

function createMovieNode(movie) {
    const div = document.createElement('div');
    div.className = 'movie-card';
    div.id = movie.id;

    const isLiked  = state.likedMovies.some(likedMovie => likedMovie.id === movie.id);

    div.innerHTML = `
        <img class = "movie-poster" src="${poster_path_prefix + movie.poster_path}" alt="Movie Poster">
        <h3 class="movie-title">${movie.title}</h3>
        <div class="movie-card-footer">
            <div class="rating">
                <i class="ion-star"></i>
                <p>${movie.vote_average}</p>
            </div>
            <i class="heart-icon ${isLiked? 'ion-ios-heart' : 'ion-ios-heart-outline'}"></i>
        </div>
    `;

    const movieTitle = div.querySelector('.movie-title');
    movieTitle.addEventListener('click', () => {
        openMovieModal(movie);
    });

    return div;
}

function renderView() {
    if (state.tab === "home") {
        /**
         * Show HOME
         */
        const movieContainer = document.querySelector('.movie-container');

        // change page
        const pageDiv = document.getElementById('page');
        pageDiv.innerHTML = `${state.currentPage}/${state.totalPages}`;

        // change movie container
        movieContainer.innerHTML = '';
        state.movies.forEach((movie) => {
            const li = createMovieNode(movie);
            movieContainer.append(li);
        });
        clickLiked();
    } else if (state.tab === "liked") {
        /**
         * Show LIKED
         */
        const likedContainer = document.querySelector('.liked-container');

        // change liked container
        likedContainer.innerHTML = '';

        state.likedMovies.forEach((movie) => {
            const li = createMovieNode(movie);
            likedContainer.append(li);
        });
        clickLiked();
    }
    
}

/**
 * click liked
 */

function clickLiked() {
    let movieContainer = document.querySelector('.movie-container');
    if (state.tab === "liked") {
        movieContainer = document.querySelector('.liked-container');
    }

    movieContainer.removeEventListener('click', handleMovieCardClick);
    movieContainer.addEventListener('click', handleMovieCardClick);
}

function handleMovieCardClick(e) {
    const element = e.target;
    const heartIcon = element.closest('.heart-icon');
    const movieCard = element.closest('.movie-card');

    if (heartIcon) {
        // heartIcon.classList.toggle('ion-ios-heart-outline');
        // heartIcon.classList.toggle('ion-ios-heart');

        if (heartIcon.classList.contains('ion-ios-heart')) {
            console.log("like -> unlike");
            heartIcon.classList.toggle('ion-ios-heart');
            heartIcon.classList.toggle('ion-ios-heart-outline');
            state.likedMovies = state.likedMovies.filter((movie) => {
                return Number(movieCard.id) !== movie.id;
            });
        } else if (heartIcon.classList.contains('ion-ios-heart-outline')) {
            console.log("unlike -> like");
            heartIcon.classList.toggle('ion-ios-heart-outline');
            heartIcon.classList.toggle('ion-ios-heart');
            const likedMovie = state.movies.find(function(movie) {
                return Number(movieCard.id) === movie.id;
            });
            state.likedMovies.push(likedMovie);
        }
    }
}

/**
 * movie detail modal
 */
function openMovieModal(movie) {
    fetch(`https://api.themoviedb.org/3/movie/${movie.id}?language=en-US`, options)
        .then((resp) => {
            return resp.json();
        })
        .then((data) => {
            createMovieDetailModal(data);
            return data;
        })
        .catch((err) => {
            console.error(err);
        });
    
    const modal = document.querySelector('.modal');
    modal.style.display = 'block';

    const modalClose = document.querySelector('.modal-close');
    modalClose.addEventListener('click', () => {
        closeMovieModal();
    });
}

function closeMovieModal() {
    const modal = document.querySelector('.modal');
    modal.style.display = 'none';
}

function createMovieDetailModal(movie) {
    const movieDetail = document.querySelector('.movie-detail');

    const genresNames = movie.genres.map((genre) => {return genre.name;}).join(', ');
    const logoImages = movie.production_companies
        .map((company) => company.logo_path)
        .filter((logo) => logo !== null)
        .map((logo) => `<img class="production-company-logo" src="${poster_path_prefix + logo}">`)
        .join(', ');

    
    movieDetail.innerHTML = `
        <img class="movie-detail-poster" src="${poster_path_prefix + movie.poster_path}">
        <div class="movie-detail-info">
            <h3 class="movie-detail-title">${movie.title}</h3>
            <b>Overview</b>
            <p class="movie-detail-overview">${movie.overview}</p>
            <b>Genres</b>
            <p class="movie-detail-genres">${genresNames}</p>
            <b>Rating</b>
            <p class="movie-detail-rating">${movie.vote_average}</p>
            <b>Production companies</b>
            <div class="movie-detail-production-companies">${logoImages}</div>
        </div>
    `;
}