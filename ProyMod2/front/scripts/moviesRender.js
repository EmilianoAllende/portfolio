const moviesContainer = document.getElementById("moviesContainer");

const escapeHTML = (str) => {
    const div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
};

const moviesRender = (data) => {
    data.forEach((movie) => {
        const card = document.createElement("div");
        card.classList.add("card");

        const title = document.createElement("h4");
        title.innerText = escapeHTML(movie.title);

        const poster = document.createElement("img");
        poster.src = escapeHTML(movie.poster);

        const year = document.createElement("p");
        year.innerText = escapeHTML(movie.year.toString());

        const director = document.createElement("p");
        director.innerText = escapeHTML(movie.director);

        const duration = document.createElement("p");
        duration.innerText = escapeHTML(movie.duration);

        const genre = document.createElement("p");
        genre.innerText = escapeHTML(movie.genre.join(', '));

        const rate = document.createElement("p");
        rate.innerText = escapeHTML(movie.rate.toString());

        card.appendChild(poster);
        card.appendChild(title);
        card.appendChild(year);
        card.appendChild(director);
        card.appendChild(duration);
        card.appendChild(genre);
        card.appendChild(rate);

        moviesContainer.appendChild(card);
    });
};

module.exports = moviesRender;