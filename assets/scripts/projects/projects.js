import Modal from "/assets/scripts/modals/modal.js";

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

            if (projects === null || projects === undefined || projects.metadata.lastUpdate === undefined || projects.metadata.lastUpdate === null) {
                const response = await fetch('./assets/scripts/projects.json');
                if (!response.ok) {
                    throw new Error('Error with Network Response');
                }
                this.projects = await response.json();
                localStorage.setItem('projects', JSON.stringify(this.projects));
                this.projects = this.projects.projects;
            } else {
                const lastUpdate = new Date(projects.metadata.lastUpdate);
                const currentDate = new Date();
                const diffTime = Math.abs(currentDate - lastUpdate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays > 7) {
                    const response = await fetch('./assets/scripts/projects.json');
                    if (!response.ok) {
                        throw new Error('Error with Network Response');
                    }
                    this.projects = await response.json();
                    localStorage.setItem('projects', JSON.stringify(this.projects));
                } else {
                    this.projects = projects.projects;
                }
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
                    <a id="${project.identifier}" class="w-full ">
                        <img src="${project.screenshot}" class="justify-center size-fit scale-100 relative z-0 hover:blur-sm hover:bg-black/75" />
                        <div class="w-32 h-16 font-bold text-center text-white absolute top-0 -right-2 z-10">
                            <div class="triangleIndicator hidden hover:inline-block"> <span>${project.year_start}</span></div>
                        </div>
                        <p class="max-w-1/2 font-bold text-white self-center justify-center text-center absolute text-wrap inset-x-1/3 inset-y-0 content-around z-10 hover:invert hover:contrast-125 hover:bg-black/80">${project.name}</p>
                    </a>`;	
                projectElement.addEventListener('click', (e) => {
                    e.preventDefault();
                    const linkElement = e.target.closest('a');
                    if (linkElement) {
                        this.drawProjectModal(linkElement.id);
                    }
                });
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

    drawTechStackTags(project) {
        const techStacks = [
            { name: 'React.js', background: 'bg-black', color: 'text-white', icon: 'fa-brands fa-react text-cyan-500' },
            { name: 'Tailwind', background: 'bg-slate-700', color: 'text-white', icon: 'fa-brands fa-react text-cyan-500' },
            { name: 'Laravel', background: 'bg-white', color: 'text-red-500', icon: 'fa-brands fa-laravel' },
            { name: 'Bootstrap', background: 'bg-purple-700', color: 'text-white', icon: 'fa-brands fa-bootstrap' },
        ];
        
        let techStackContainer = document.createElement('div');
        techStackContainer.className = 'flex flex-row';
        project.techstack.forEach(stack => {
            
            let techStackTag = document.createElement('span');
            techStackTag.className = 'chip';
            techStackTag.setAttribute('role', 'chip');
            techStackTag.setAttribute('aria-label', stack);
            techStackTag.textContent = stack;

            let techStackSel = techStacks.find(stackObj => stackObj.name === stack)
            
            if(techStackSel !== undefined && techStackSel.background !== undefined && techStackSel.color !== undefined) {
                techStackTag.classList.add(techStackSel.background, techStackSel.color);
            }

            if(techStackSel !== undefined && techStackSel.icon !== undefined) {
                let icon = document.createElement('i');
                icon.className = techStackSel.icon;
                techStackTag.prepend(icon);
            } else if(techStackSel !== undefined && techStackSel.iconPath !== undefined){

            }
            techStackContainer.appendChild(techStackTag);
        });
        return techStackContainer.outerHTML;
    }

    drawMediaGallery(project) {
        let mediaContainer = document.createElement('div');
        mediaContainer.className = 'overflow-x-scroll align-middle scroll-smooth snap-x snap-mandatory snap-always py-5 *:mx-24 *:w-3/4 *:border *:h-auto md:flex md:flex-row';
        
        if(project.media !== undefined) {
            project.media.forEach(media => {
                if(media.type === 'image') {
                    var mediaElement = document.createElement('img');
                } else if(media.type === 'video') {
                    var mediaElement = document.createElement('iframe');
                    mediaElement.width = '560';
                    mediaElement.height = '315';
                    mediaElement.src = 'https://youtube-nocookie.com/embed/'+media.url;
                    mediaElement.frameBorder = '0';
                    mediaElement.allow = 'autoplay; encrypted-media';
                    mediaElement.allowFullscreen = true;
                } else {
                    console.log(media);
                }
                if(media.type !== 'video') mediaElement.src = media.url;
                mediaContainer.appendChild(mediaElement);
            });
            return mediaContainer.outerHTML;
        }
        return 'Loading..';
    }

    drawProjectModal(proj_id) {
        const project = this.projects.find(project => project.identifier === proj_id);
        if(project !== undefined) {
            const modal = new Modal({
                config: {
                    'title': `<a href="${project.website}" title="Go to External Website">${project.name}<i class="ml-2 fa-solid fa-arrow-up-right-from-square"></i></a>`,
                    'parentDiv': 'projects',
                    'modalSize': 'lg',
                    'actions': {
                        'close': {
                            'label': 'Close',
                            'type': 'secondary'
                        }
                    }
                },
                modalContent: `
                    <div class="flex flex-col-reverse overflow-auto">
                        <div class="flex flex-col my-2 border-b border-b-slate-200">
                            <div class="flex flex-row justify-evenly *:mr-1.5 *:py-2">
                                <p>Start Date: ${project.month_start}/${project.year_start}</p>
                                ${project.completed === false 
                                    ? `<p>Status: On Development</p>` 
                                    : `<p>Status: Completed</p>
                                    <p>End Date: ${project.month_ended}/${project.year_ended !== undefined ? project.year_ended : project.year_start}</p>`}
                            </div>
                        </div>
                        <div class="flex flex-col">
                            <div class="flex flex-row">
                                ${this.drawTechStackTags(project)}
                            </div>
                        </div>

                    </div>
                    <div class="flex flex-col-reverse md:flex-row-reverse">
                        <div class="flex flex-col w-5/6 md:w-1/3">
                            <img src="${project.screenshot}" class="float-right size-fit" alt="${project.title}">
                        </div>
                        <div class="flex flex-col content-end border mr-2">
                            <p class="text-lg font-bold">Description</p>
                            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quod. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quod. </p>
                        </div>
                    </div>
                    <div class="hidden mt-4 *:my-2 md:flex md:flex-col">
                        <div class="flex flex-col text-lg font-bold">Media</div>
                        <div class="overflow-x-scroll h-full align-middle scroll-smooth snap-x snap-mandatory snap-always py-5 md:h-3/5 *:mx-24 *:w-3/4 *:border *:h-auto md:flex md:flex-row">
                            ${this.drawMediaGallery(project)}
                        </div>
                    </div>
                `,
            });

            modal.open();
        }
    }
}