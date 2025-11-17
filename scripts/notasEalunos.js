// Espera o documento HTML ser completamente carregado para rodar o script
document.addEventListener('DOMContentLoaded', () => {

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

    const alunoSearch = document.getElementById('alunoSearch');
    const moreInfoAluno = document.querySelector('.infoAluno');
    
    var coutClickAlunoSearch = 0

    alunoSearch.addEventListener('click', () => {
        moreInfoAluno.style.display = 'block'
        alunoSearch.style.borderRadius = '1px'
        alunoSearch.style.boxShadow = 'none'
        alunoSearch.style.transform = 'none'
        coutClickAlunoSearch++;

        console.log(coutClickAlunoSearch)
        if(coutClickAlunoSearch == 2) {
            moreInfoAluno.style.display = 'none'
            alunoSearch.style.borderRadius = '50px'
            alunoSearch.style.boxShadow = '0px 6px 5px var(--shadow2)'
            alunoSearch.style.transform = 'scale(1.01)'
            coutClickAlunoSearch = 0
        }
    });

    // --- CÓDIGO DE NOTAS (COM A CORREÇÃO) ---

    function calcularMedia(row) {
    
    const inputs = row.querySelectorAll('.input-nota');
    const mediaCell = row.querySelector('.mediaNotaTable');

    if (!mediaCell) {
        console.warn("Célula de média (.mediaNotaTable) não encontrada na linha.");
        return;
    }

    let total = 0;
    
    inputs.forEach(input => {
        const notaString = input.value;
        const notaFormatada = notaString.replace(',', '.');
        const notaValor = parseFloat(notaFormatada);

        if (!isNaN(notaValor)) {
            total += notaValor;
        }
    });

    if (inputs.length > 0) {
        
        const media = total / inputs.length; 

        mediaCell.textContent = media.toFixed(2).replace('.', ',');

        if (media < 5.0) {
            mediaCell.classList.add('baixa');
        } else {
            mediaCell.classList.remove('baixa');
        }
        if (media >= 5.0) {
            mediaCell.classList.add('alta');
        } else {
            mediaCell.classList.remove('alta')
        }
        
    } else {
        mediaCell.textContent = "-";
        mediaCell.classList.remove('baixa');
    }
}

function processarNota(inputElement) {
    const notaString = inputElement.value;

    if (notaString.trim() === "") {
        inputElement.classList.remove('baixa');
    }

    const notaFormatada = notaString.replace(',', '.');
    const notaValor = parseFloat(notaFormatada);

    if (isNaN(notaValor)) {
        inputElement.classList.remove('baixa');
    } else {
        if (notaValor < 5.0) {
            inputElement.classList.add('baixa');
        } else {
            inputElement.classList.remove('baixa');
        }
    }
    
    console.log(`Nota "salva": ${notaValor}`);
    const row = inputElement.closest('tr');

    if (row) {
        calcularMedia(row);
    }
}
    const tabelaBody = document.querySelector('.itensNotas tbody');

    if (tabelaBody) {

        tabelaBody.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && event.target.classList.contains('input-nota')) {
                event.preventDefault(); 
                processarNota(event.target);
                event.target.blur(); 
            }
        });

        tabelaBody.addEventListener('blur', (event) => {
            if (event.target.classList.contains('input-nota')) {
                processarNota(event.target);
            }
        }, true);

    } else {
        console.warn("AVISO: Tabela '.itensNotas tbody' não encontrada. A funcionalidade de notas não será ativada.");
    }
});