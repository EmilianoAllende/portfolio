document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.form');
    const titleInput = document.getElementById('title');
    const yearInput = document.getElementById('year');
    const directorInput = document.getElementById('director');
    const genreInput = document.getElementById('genre');
    const durationInput = document.getElementById('duration');
    const rateInput = document.getElementById('rate');
    const posterInput = document.getElementById('poster');
    const sendButton = document.getElementById('send');
    const resetButton = document.getElementById('resetFields');
    const errorMessagesDiv = document.getElementById('errorMessages');

    resetButton.addEventListener("click", () => {
        titleInput.value = "";
        yearInput.value = "";
        directorInput.value = "";
        genreInput.value = "";
        durationInput.value = "";
        rateInput.value = "";
        posterInput.value = "";
        errorMessagesDiv.textContent = '';

        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        errorMessagesDiv.textContent = "";

        if (
            titleInput.value === "" || yearInput.value === "" || directorInput.value === "" || genreInput.value === "" || durationInput.value === "" || rateInput.value === "" || posterInput.value === ""
        ) {
            errorMessagesDiv.textContent = "All fields must be fulfilled.";
            return;
        }

        const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
        const selectedGenres = [];
        checkboxes.forEach(checkbox => {
            selectedGenres.push(checkbox.value);
        });

        const movieData = {
            title: titleInput.value,
            year: yearInput.value,
            director: directorInput.value,
            genre: selectedGenres,
            duration: durationInput.value,
            rate: rateInput.value,
            poster: posterInput.value
        };

        await axios.post("http://localhost:3000/movies", movieData)
            .then(res => {
                resetButton.click();
                alert('Movie added successfully.');
            })
            .catch(err => {
                console.error("Error creating movie: ", err.message);
                errorMessagesDiv.textContent = "New movie post failed.";
            });
    });
});