// Espera o documento HTML ser completamente carregado para rodar o script
document.addEventListener('DOMContentLoaded', () => {

    // 1. Seleciona o campo de busca e todos os itens da lista (os <li>)
    const searchInput = document.getElementById('searchInput');
    const studentItems = document.querySelectorAll('.itemThree ul li');

    // 2. Adiciona um "ouvinte" ao campo de busca que dispara a cada tecla digitada
    searchInput.addEventListener('input', (event) => {
        
        // 3. Pega o texto digitado e converte para minúsculas (para não diferenciar maiúsculas/minúsculas)
        const searchTerm = event.target.value.toLowerCase();

        // 4. Passa por cada item da lista (cada <li>)
        studentItems.forEach(item => {
            
            // 5. Pega o texto do RA e do Nome de CADA aluno
            // (Usamos .querySelector DENTRO do 'item' para pegar o RA/Nome só daquele aluno)
            const raAluno = item.querySelector('.raAluno').textContent.toLowerCase();
            const nameAluno = item.querySelector('.nameAluno').textContent.toLowerCase();

            // 6. Verifica se o texto do RA ou do Nome "inclui" o termo pesquisado
            const isMatch = raAluno.includes(searchTerm) || nameAluno.includes(searchTerm);

            // 7. Mostra ou esconde o item (<li>) baseado na correspondência
            if (isMatch) {
                item.style.display = 'block'; // Mostra o item se for igual
            } else {
                item.style.display = 'none';  // Esconde o item se for diferente
            }
        });
    });

    const openFileBody = document.querySelector('.bntFileBody');
    const closedBnt = document.querySelector('.btnCancelFile');
    const closedBntX = document.getElementById('closedFileBody');

    openFileBody.addEventListener('click', () => {
        document.querySelector('.fileBody').style.display = 'flex';
    });
    closedBnt.addEventListener('click', () => {
        document.querySelector('.fileBody').style.display = 'none';
    });
    closedBntX.addEventListener('click', () => {
        document.querySelector('.fileBody').style.display = 'none';
    });

    const openCABody = document.querySelector('.bntCadastrarAluno');
    const closedCABody = document.getElementById('closedCA');
    const cancelCABody = document.getElementById('btnCancelCA');

    openCABody.addEventListener('click', () => {
        document.querySelector('.cadastrarAlunoBody').style.display = 'block'
    });
    closedCABody.addEventListener('click', () => {
        document.querySelector('.cadastrarAlunoBody').style.display = 'none'
    });
    cancelCABody.addEventListener('click', () => {
        document.querySelector('.cadastrarAlunoBody').style.display = 'none'
    });

    const addComp = document.querySelector('.btnAddComp');
    const cancelComp = document.getElementById('cancelComp');
    var countClickAdd = 0;

    addComp.addEventListener('click', () => {
        document.querySelector('.addComponents').style.display = 'flex'
        countClickAdd++;

        if(countClickAdd == 2) {
            document.querySelector('.addComponents').style.display = 'none'
            countClickAdd = 0;
        }
    });

    cancelComp.addEventListener('click', () => {
        document.querySelector('.addComponents').style.display = 'none'
        countClickAdd = 0;
    });

    const oneEditComp = document.getElementById('oneEditComp');
    const allEditComp = document.getElementById('allEditComp');
    var countClickEditOne = 0;
    var countClickEditAll = 0;

    oneEditComp.addEventListener('click', () => {
        oneEditComp.style.background = 'var(--black)'
        oneEditComp.style.color = 'var(--white)'
        oneEditComp.style.border = 'none'

        allEditComp.style.background = 'var(--white)'
        allEditComp.style.color = 'var(--black)'
        allEditComp.style.border = '1px solid var(--lightgrey)'

        countClickEditOne++;
        countClickEditAll = 0;
        if (countClickEditOne == 2) {
            oneEditComp.style.background = 'var(--white)'
            oneEditComp.style.color = 'var(--black)'
            oneEditComp.style.border = '1px solid var(--lightgrey)'
            countClickEditOne = 0
        }
    });

    allEditComp.addEventListener('click', () => {
        allEditComp.style.background = 'var(--black)'
        allEditComp.style.color = 'var(--white)'
        allEditComp.style.border = 'none'

        oneEditComp.style.background = 'var(--white)'
        oneEditComp.style.color = 'var(--black)'
        oneEditComp.style.border = '1px solid var(--lightgrey)'

        countClickEditAll++;
        countClickEditOne = 0;
        if (countClickEditAll == 2) {
            allEditComp.style.background = 'var(--white)'
            allEditComp.style.color = 'var(--black)'
            allEditComp.style.border = '1px solid var(--lightgrey)'
            countClickEditAll = 0
        }
    });
});