// headerMenu.js
(function () {
    function initHeaderMenu() {
        const pointSettingsElems = document.querySelectorAll('.pointSettings');

        if (!pointSettingsElems || pointSettingsElems.length === 0) return;

        pointSettingsElems.forEach(pointSettings => {
            const buttonOptions = pointSettings.querySelector('.buttonOptions');
            const optionsHeader = pointSettings.querySelector('.optionsHeader');

            if (!buttonOptions || !optionsHeader) return;

            buttonOptions.addEventListener('click', (e) => {
                e.stopPropagation();
                optionsHeader.classList.toggle('show');
            });

            document.addEventListener('click', (event) => {
                if (!event.target.closest('.pointSettings')) {
                    optionsHeader.classList.remove('show');
                }
            });

            document.addEventListener('keydown', (event) => {
                if (event.key === 'Escape' || event.key === 'Esc') {
                    optionsHeader.classList.remove('show');
                }
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHeaderMenu);
    } else {
        initHeaderMenu();
    }
})();