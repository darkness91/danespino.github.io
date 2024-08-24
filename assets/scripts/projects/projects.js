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
        document.getElementById('widgetHeader').addEventListener('mouseover', (e)=>{
            document.getElementById('filterButton').classList.remove('hidden');
            document.getElementById('filterButton').classList.add('inline-block');
        });
        document.getElementById('widgetHeader').addEventListener('mouseleave', (e)=>{
            document.getElementById('filterButton').classList.remove('inline-block');
            document.getElementById('filterButton').classList.add('hidden');
        });
    }

    async processProjectsInfo(initialCall = false) {
        await this.getWidgetInfo();

        if(initialCall) {
            this.drawUIElements();
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
                        <img src="${project.screenshot}" class="justify-center size-full scale-100 relative z-0" />
                        <div class="w-32 h-16 font-bold text-center text-white absolute top-0 -right-2 z-10">
                            <div class="triangleIndicator hidden hover:inline-block"> <span>${project.year_start}</span></div>
                            
                        </div>
                        <p class="max-w-1/2 font-bold text-white self-center justify-center text-center absolute text-wrap inset-x-1/3 inset-y-0 content-around z-10">${project.name}</p>
                    </a>`;	
                projectFolio.appendChild(projectElement);
                
            });
        } else {
            document.getElementById('projects').innerHTML = '<h1>No projects found</h1>';
        }    
    }
    
    drawUIElements() {
        let yearSelOptions = [];
        let stackSelOptions = [];

        if(this.projects.length>0) {
            // Creating title element
            this.drawWidgetHeader();

            let yearSelector = document.getElementById('yearSelector');
            let stackSelector = document.getElementById('stackSelector');

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

    drawWidgetHeader() {
        const projectDiv = document.getElementById('projects');

        let widgetHeaderTitle = document.createElement('div')
        widgetHeaderTitle.setAttribute("id", "widgetHeadTitle");
        let headerTitle = document.createElement('h2');
        headerTitle.className = 'text-gray-200 font-extrabold text-4xl py-4';
        headerTitle.textContent = 'Projects';
        widgetHeaderTitle.appendChild(headerTitle);
        
        // Create the Button to show Filter Icon
        let filterButton = document.createElement('button');
        let filterIcon = document.createElement('i');
        filterButton.setAttribute('id', 'filterButton');
        filterButton.className = 'ml-2 hidden';            // Create an icon inside the button
        filterIcon.className = 'fa-solid fa-filter text-white';
        filterButton.appendChild(filterIcon);

        // Create container for filter options
        let filterContainer = document.createElement('div');
        filterContainer.className = 'flex flex-row-reverse flex-wrap float-end items-stretch *:mx-6';
        filterContainer.setAttribute('x-show', 'filterByDiv');
        filterContainer.innerHTML = `<div>
                        <label for="stacks" class="block mb-2 text-sm font-medium text-gray-400 w-full">Stack</label>
                        <select name="stacks" id="stackSelector" class="rounded-lg px-4 py-2.5 h-12 border border-gray-300 text-gray-600 text-base focus:h-auto" multiple>
                            <option>All</option>
                        </select>    
                    </div>
                    <div>
                        <label for="year" class="block mb-2 text-sm font-medium text-gray-400 w-full">Year</label>
                        <select name="year" id="yearSelector" class="rounded-lg px-4 py-2.5 h-12 border border-gray-300 text-gray-600 text-base">
                            <option>All</option>
                        </select>    
                    </div>`;
        
        // Adding the UI Elements as the widgetHeader
        let widgetHeader = document.createElement('div')
        widgetHeader.setAttribute('id', 'widgetHeader');
        widgetHeader.className = 'w-full flex items-center align-middle justify-center ml-2 py-4';
        widgetHeader.appendChild(widgetHeaderTitle);
        widgetHeader.appendChild(filterButton);
        widgetHeader.appendChild(filterContainer);
        
        projectDiv.prepend(widgetHeader);
        // Attach Alpine.js to avoid any crash
        widgetHeader.setAttribute('x-data', '{ filterByDiv: false }');
        filterButton.setAttribute('x-init', `
            $el.addEventListener('click', function() {
                filterByDiv = !filterByDiv;
            });
        `); // Attach Alpine.js directive

        return;
    }
}