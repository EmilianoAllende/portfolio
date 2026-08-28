class Activity {
    constructor(id, title, description, imgUrl) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.imgUrl = imgUrl;
    };
};


class Repository {
    constructor() {
        this.activities = [];
        this.id = 0;
    };
    
    getAllActivities() {
        return this.activities;
    };
    
    createActivity (title, description, imgUrl){
        const id = this.id++;
        const activity = new Activity (id, title, description, imgUrl);
        this.activities.push(activity);
    };
    
    deleteActivity(id) {
        this.activities = this.activities.filter(activity => activity.id !== id);
    };
};


const repository = new Repository();


function addActivity(activity) {
    const { id, title, description, imgUrl } = activity;
    const h3 = document.createElement("h3");
    h3.innerHTML = title;
    const p = document.createElement("p");
    p.textContent = description;
    const img = document.createElement("img");
    img.src = imgUrl;

    const actCard = document.createElement('div');
    actCard.className = "card";
    actCard.id = id;

    actCard.appendChild(h3);
    actCard.appendChild(p);
    actCard.appendChild(img);

    return actCard;
};


function buildActivities() {
    const cardsContainer = document.getElementById("card_render_area");
    cardsContainer.innerHTML = "";
    const allActivities = repository.getAllActivities();
    const htmlActivities = allActivities.map((activity) => addActivity(activity));
    htmlActivities.forEach((activityHTML) => cardsContainer.appendChild(activityHTML));
};


function handlerClickAdd(event) {
    event.preventDefault();
    const title = document.getElementById("title");
    const description = document.getElementById("description");
    const imgUrl = document.getElementById("imgUrl");

    const titleValue = title.value;
    const descriptionValue = description.value;
    const imgUrlValue = imgUrl.value;

    if (!titleValue.trim() || !descriptionValue.trim() || !imgUrlValue.trim()) {
        alert("Por favor, complete todos lo campos.");
    };

    repository.createActivity(titleValue, descriptionValue, imgUrlValue);

    buildActivities();

    title.value = "";
    description.value = "";
    imgUrl.value = "";
};


const addButton = document.getElementById("addButton");
addButton.addEventListener("click", handlerClickAdd);