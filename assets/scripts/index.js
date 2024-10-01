import ProjectGallery from "./projects/projects.js";

const showLoader = (show = false) => {
    const loaderDiv = document.getElementById("loader");
    const workArea = document.getElementById("landingPage");

    if(show) {
        document.body.classList.remove("bg-scroll");
        workArea.style = "display: none; visibility: false;";
        document.body.style = "overflow: hidden";
        loaderDiv.style = "display: flex; visibility: true;";
        
    } else {
        workArea.style = "display: block";
        document.body.style = "overflow: hidden";
        loaderDiv.style = "display: none";
    }
    return;
}

document.addEventListener('DOMContentLoaded', () => {
    showLoader(true);
    const projectWidget = new ProjectGallery();
});

window.addEventListener('load', () => {
    showLoader(false);
});