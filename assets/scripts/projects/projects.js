export default class ProjectGallery {
    constructor() {
        this.projects = [];
        this.filteredByYear = false;
        this.filteredByStack = false;
        this.filteredYears = [];
        this.filteredStacks = [];
        this.processProjectsInfo(true);
    }

    async getWidgetInfo() {
        try {
            let projects = JSON.parse(localStorage.getItem('projects'));

            if (projects === null || projects === undefined) {
                const response = await fetch('./assets/scripts/projects.json');
                if (!response.ok) {
                    throw new Error('Error with Network Response');
                }
                this.projects = await response.json();
                localStorage.setItem('projects', JSON.stringify(this.projects));
            } else {
                this.projects = projects;
            }
        } catch (error) {
            console.error(error);
            return null; // Handle or propagate the error as needed
        }       
    }

    setListeners() {
        document.getElementById('yearSelector').addEventListener('change', (e) => {
            if(e.target.value === 'All') {
                this.filteredByYear = false;
                this.filteredYears = [];
            } else {
                this.filteredByYear = true;
                this.filteredYears = (e.target.value!=='all') ?  [e.target.value] : [];
            }
            this.drawWidget();  
        });
        document.getElementById('stackSelector').addEventListener('change', (e) => {
            const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);

            if (selectedOptions.length === 0 || selectedOptions.includes('All')) {
                this.filteredByStack = false;
                this.filteredStacks = [];
            } else {
                this.filteredByStack = true;
                this.filteredStacks = selectedOptions;
            }
            this.drawWidget();  
        });
    }

    async processProjectsInfo(initialCall = false) {
        await this.getWidgetInfo();

        if(initialCall) {
            this.drawFilters();
            this.setListeners();
        }

        this.drawWidget();  
    }

    drawWidget() {
        const projectFolio = document.getElementById('projects_gallery');        

        if(this.projects.length>0) {
            projectFolio.innerHTML = '';
            this.projects.forEach(project => {
                // If it wasn't started or finished in that year, we exclude it
                if(this.filteredByYear){
                    if (!this.filteredYears.includes(String(project.year_start)) && 
                        !this.filteredYears.includes(String(project.year_end))) {
                        return;
                    }
                }
                    
                // If any of the tech stacks doesn't appear according to matching criteria, we will discard it too
                if(this.filteredByStack) {
                    if(!project.techstack.some(stack => this.filteredStacks.includes(String(stack)))) {
                        return;
                    }
                } 
                
                let projectElement = document.createElement('div');
                projectElement.classList.value = 'snap-center snap-always flex flex-shrink-0 items-stretch justify-center relative hover:scale-100 hover:text-2xl';
                projectElement.innerHTML = `
                    <a href="${project.website}" target="_blank" class="h-full w-full">
                        <img src="${project.screenshot}" class="justify-center w-full h-auto scale-100 relative z-0" />
                        <div class="w-32 h-16 font-bold text-center text-white absolute top-0 -right-2 z-10">
                            <div class="triangleIndicator hidden hover:inline-block"> <span>${project.year_start}</span></div>
                            
                        </div>
                        <p class="w-full font-bold text-white self-center justify-center absolute inset-x-1/3 inset-y-1/2 z-10">${project.name}</p>
                    </a>`;	
                projectFolio.appendChild(projectElement);
                
            });
        } else {
            document.getElementById('projects').innerHTML = '<h1>No projects found</h1>';
        }    
    }
    
    drawFilters() {
        const yearSelector = document.getElementById('yearSelector');
        const stackSelector = document.getElementById('stackSelector');

        let yearSelOptions = [];
        let stackSelOptions = [];

        if(this.projects.length>0) {
            this.projects.forEach(project => {
                if(!yearSelOptions.includes(project.year_start)) {
                    yearSelOptions.push(project.year_start);
                    let selectOption = document.createElement('option');
                    selectOption.value = project.year_start;
                    selectOption.text = project.year_start;
                    yearSelector.appendChild(selectOption);
                }

                if(project.techstack!==undefined && Array.isArray(project.techstack)) {
                    project.techstack.forEach(stack => {
                        if(!stackSelOptions.includes(stack)) {
                            stackSelOptions.push(stack);
                            let selectOption = document.createElement('option');
                            selectOption.value = stack;
                            selectOption.text = stack;
                            stackSelector.appendChild(selectOption);
                        }
                    });
                } else if(project.techstack!==undefined && typeof project.techstack === 'string'){
                    if(!stackSelOptions.includes(project.techstack)) {
                        stackSelOptions.push(project.techstack);
                        let selectOption = document.createElement('option');
                        selectOption.value = stack;
                        selectOption.text = stack;
                        stackSelector.appendChild(selectOption);
                    }
                } else {
                    return;     // if element is malformed it won't be processed
                }
            });
        } else {
            return;
        }
    }
}