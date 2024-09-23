export default class Modal {
    constructor({ config, modalContent }) {
        this.config = config || {};
        this.title = ('title' in this.config) ? this.config.title : 'Modal Window';
        this.body = modalContent;
        this.modalParentDiv = ('parentDiv' in this.config) ? document.getElementById(this.config.parentDiv) : document.body;
        this.actions = ('actions' in this.config) ? this.config.actions : null;
        this.modalSize = ('size' in this.config) ? this.config.size : 'auto';    
    }

    createModal(reuse = false) {
        const modal = (reuse) ? document.getElementById('modal') : document.createElement('div');
        const modalInner = document.createElement('div');
        const modalWindow = document.createElement('div');
        document.body.classList.remove('overflow');
        modal.classList.add('-mt-10', 'fixed', 'inset-0', 'z-50', 'flex', 'items-center', 'justify-center', 'overflow-auto', 'bg-black', 'bg-opacity-80');
        let modalSizeStyle = (this.modalSize !== 'auto') ? 'w-3/4 h-screen' : 'w-5/6';
        modalSizeStyle.split(' ').forEach(style => modalInner.classList.add(style));
        modalInner.classList.add('px-6', 'py-4', 'mx-auto', 'text-left', 'bg-white', 'rounded-lg', 'shadow-lg', 'overflow-auto');

        modal.setAttribute('role', 'dialog');
        modal.setAttribute('x-show', '{ showModal: true }');
        modal.setAttribute('id', 'modal');
        modal.setAttribute('x-on:keydown.escape.window', 'showModal = false');
        modalInner.setAttribute('id', 'modalInner');
        modalInner.setAttribute('x-transition:enter', 'motion-safe:ease-out duration-300');
        modalInner.setAttribute('x-transition:enter-start', 'opacity-0 scale-90');
        modalInner.setAttribute('x-transition:enter-end', 'opacity-100 scale-100');
        modalWindow.setAttribute('id', 'modalWindow');

        // TODO: Add Modal Inner Window Dynamically so you can add event listeners as alpine events
        modal.innerHTML= '';    // Clear content that may be in the modal

        modalWindow.innerHTML = `
            <div class="flex sticky -top-10 bg-white -m-2 py-7 items-center justify-between">
                <div class="mr-3 text-2xl font-bold text-black max-w-none">${this.title}</div>
                <button type="button" id="closeModalBtn" class="z-50 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <div class="flex flex-col align-middle justify-center content-center">
                ${this.body}
            </div>
            <div class="sticky -bottom-10 bg-white -m-2 py-6">
                <div class="flex justify-end align-middle">
                    ${this.createButtons()}
                </div>
            </div>
        `;

        modalInner.appendChild(modalWindow);
        modal.appendChild(modalInner);
        this.modalParentDiv.appendChild(modal);
    }

    createButtons() {
        let buttons = '';
        if (this.actions !== null) {
            for (const key in this.actions) {
                buttons += `<button type="button" id="${key}ConfBtn" class="btn btn-${this.actions[key].type}" data-action="${key}">${this.actions[key].label}</button>`;
            }
        } else {
            buttons = `<button type="button" id="closeConfBtn" class="btn btn-secondary" data-bs-dismiss="modal">${this.actions['close'].label}</button>`;
        }
        return buttons;
    }

    open() {
        const modal = document.getElementById('modal');
        if( modal === null || modal === undefined ) {
            this.createModal();

        } else {
            modal.innerHTML = '';
            this.createModal(true);
        }

        document.getElementById("closeModalBtn").addEventListener('click', (event) => {
            this.close();
        });
        document.getElementById("closeConfBtn").addEventListener('click', (event) => {
            this.close();
        });

    }

    close() {
        const modal = document.getElementById('modal');
        modal.remove();
    }
}