// Espera o documento HTML ser completamente carregado para rodar o script
document.addEventListener('DOMContentLoaded', () => {

    // --- CÓDIGO ORIGINAL DOS MODAIS/BOTÕES (JÁ FUNCIONAVA) ---
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


    // --- CÓDIGO DE NOTAS (COM A CORREÇÃO) ---

    // 1. Função para processar a nota (adicionar/remover classe .baixa)
    function calcularMedia(row) {
    
    // Pega todos os inputs de nota APENAS desta linha
    const inputs = row.querySelectorAll('.input-nota');
    
    // Pega a célula de média APENAS desta linha (procurando pela CLASSE)
    const mediaCell = row.querySelector('.mediaNotaTable');

    // Se a linha não tiver uma célula de média, não faz nada
    if (!mediaCell) {
        console.warn("Célula de média (.mediaNotaTable) não encontrada na linha.");
        return;
    }

    let total = 0;
    
    // Passa por todos os inputs (P1, P2, etc.) da linha
    inputs.forEach(input => {
        const notaString = input.value;
        const notaFormatada = notaString.replace(',', '.');
        const notaValor = parseFloat(notaFormatada);

        // Soma ao total APENAS se for um número válido
        // Se o campo estiver vazio ou for "abc", ele soma 0
        if (!isNaN(notaValor)) {
            total += notaValor;
        }
    });

    // Evita erro de divisão por zero se não houver inputs
    if (inputs.length > 0) {
        
        // Calcula a média dividindo pelo NÚMERO DE INPUTS (como você pediu)
        const media = total / inputs.length; 

        // 1. Mostra a média na célula, com 1 casa decimal e usando vírgula
        mediaCell.textContent = media.toFixed(1).replace('.', ',');

        // 2. Adiciona/Remove a classe 'baixa' na própria média
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
        // Se não houver inputs, mostra um traço
        mediaCell.textContent = "-";
        mediaCell.classList.remove('baixa');
    }
}

// 2. MODIFIQUE SUA FUNÇÃO "processarNota"
//    Adicione estas 3 ÚLTIMAS LINHAS a ela
function processarNota(inputElement) {
    // 1. Pega o VALOR ORIGINAL COMO TEXTO (string)
    const notaString = inputElement.value;

    // 2. Verifica se o campo está vazio
    if (notaString.trim() === "") {
        inputElement.classList.remove('baixa'); // Limpa a formatação se apagar
        // NÃO DÊ 'return' AINDA, precisamos calcular a média
    }

    // 3. Substitui a VÍRGULA (,) pelo PONTO (.)
    const notaFormatada = notaString.replace(',', '.');

    // 4. Converte o texto JÁ FORMATADO para NÚMERO (float)
    const notaValor = parseFloat(notaFormatada);

    // 5. Verifica se o resultado NÃO é um número (Ex: "abc")
    if (isNaN(notaValor)) {
        inputElement.classList.remove('baixa'); // Limpa se for inválido
    } else {
        // 6. Agora sim, faz a verificação da nota (com o valor numérico)
        if (notaValor < 5.0) {
            inputElement.classList.add('baixa');
        } else {
            inputElement.classList.remove('baixa');
        }
    }
    
    console.log(`Nota "salva": ${notaValor}`); // Isso era do seu código antigo
    

    // --- ADICIONE ESTAS 3 LINHAS NO FINAL DA FUNÇÃO ---
    // 1. Encontra a "linha-pai" (<tr>) do input que acabamos de editar
    const row = inputElement.closest('tr');

    // 2. Se encontrou a linha, manda ela para a função de calcular média
    if (row) {
        calcularMedia(row);
    }
}
    // 2. Seleciona o CORPO (tbody) da sua tabela de notas
    //    (O seletor foi corrigido para bater com o seu HTML)
    const tabelaBody = document.querySelector('.itensNotas tbody'); // <-- AQUI ESTÁ A CORREÇÃO

    // 3. VERIFICAÇÃO ANTI-ERRO
    // Só adiciona os "ouvintes" se a tabela (tabelaBody) FOI ENCONTRADA
    if (tabelaBody) {

        // 4. Adiciona o "ouvinte" para a tecla "Enter"
        tabelaBody.addEventListener('keydown', (event) => {
            // Verifica se a tecla foi 'Enter' E se o alvo foi um '.input-nota'
            if (event.key === 'Enter' && event.target.classList.contains('input-nota')) {
                event.preventDefault(); 
                processarNota(event.target);
                event.target.blur(); 
            }
        });

        // 5. Adiciona o "ouvinte" para "clicar fora" (evento 'blur')
        tabelaBody.addEventListener('blur', (event) => {
            // Verifica se o item que perdeu o foco foi um '.input-nota'
            if (event.target.classList.contains('input-nota')) {
                processarNota(event.target);
            }
        }, true); // O 'true' é importante para garantir que o evento 'blur' seja capturado

    } else {
        // Aviso opcional no console, caso a tabela não exista
        console.warn("AVISO: Tabela '.itensNotas tbody' não encontrada. A funcionalidade de notas não será ativada.");
    }

}); // Fim do 'DOMContentLoaded'