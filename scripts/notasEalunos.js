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
        document.querySelector('.addComponents').style.gap = '20px'
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

    const openEditComp = document.querySelector('.btnEditComp');
    const closedEditComp = document.getElementById('closedEditComp');
    const bodyCompEdit = document.querySelector('.editCompBody')

    openEditComp.addEventListener('click', () => {
        bodyCompEdit.style.display = 'block'
    })

    closedEditComp.addEventListener('click', () => {
        bodyCompEdit.style.display = 'none'
    })

    const oneEditComp = document.getElementById('oneEditComp');
    const allEditComp = document.getElementById('allEditComp');
    var modoEdicao = false;

    oneEditComp.addEventListener('click', () => {
        if (!modoEdicao) {
            modoEdicao = true;
            oneEditComp.style.background = 'var(--black)';
            oneEditComp.style.color = 'var(--white)';
            oneEditComp.style.border = 'none';
            
            const inputs = document.querySelectorAll('.input-nota');
            inputs.forEach(input => {
                input.disabled = false;
                input.style.backgroundColor = 'var(--white)';
                input.style.cursor = 'text';
            });
        } else {
            modoEdicao = false;
            oneEditComp.style.background = 'var(--white)';
            oneEditComp.style.color = 'var(--black)';
            oneEditComp.style.border = '1px solid var(--lightgrey)';
            
            const inputs = document.querySelectorAll('.input-nota');
            inputs.forEach(input => {
                input.disabled = true;
                input.style.backgroundColor = 'var(--lightgrey)';
                input.style.cursor = 'not-allowed';
            });
        }
    });

    allEditComp.addEventListener('click', async () => {
        if (!modoEdicao) {
            alert('Ative o modo edição primeiro clicando em "Editar notas".');
            return;
        }
        await salvarNotas();
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

// ============================================================
// SALVAR NOTAS NO BANCO DE DADOS
// ============================================================
async function salvarNotas() {
    const load = document.querySelector('.load');
    if (load) load.style.display = 'flex';

    try {
        // 1. Identifica turma
        const turmaEl = document.querySelector('.tumaLogin') || document.querySelector('.turmaLogin');
        const turmaNome = turmaEl ? turmaEl.innerText.trim() : null;

        let id_turma = null;
        const respTurmas = await fetch('/turma/all');
        if (respTurmas.ok) {
            const turmas = await respTurmas.json();
            const listaTurmas = Array.isArray(turmas) ? turmas : (turmas.turmas || []);
            let turmaObj = listaTurmas.find(t => (t.nome && t.nome.trim() === turmaNome));
            if (!turmaObj) turmaObj = listaTurmas.find(t => (t.nome && turmaNome.includes(t.nome)) || (t.nome && t.nome.includes(turmaNome)));
            if (turmaObj) id_turma = turmaObj.id;
        }

        if (!id_turma) {
            alert('Erro ao identificar a turma.');
            if (load) load.style.display = 'none';
            return;
        }

        // 2. Coleta componentes
        let fk_disciplina = null;
        if (turmaNome) {
            const respTurmas = await fetch('/turma/all');
            if (respTurmas.ok) {
                const turmas = await respTurmas.json();
                const listaTurmas = Array.isArray(turmas) ? turmas : (turmas.turmas || []);
                let turmaObj = listaTurmas.find(t => (t.nome && t.nome.trim() === turmaNome));
                if (!turmaObj) turmaObj = listaTurmas.find(t => (t.nome && turmaNome.includes(t.nome)) || (t.nome && t.nome.includes(turmaNome)));
                if (turmaObj) fk_disciplina = turmaObj.fk_disciplina_codigo || turmaObj.FK_DISCIPLINA_CODIGO;
            }
        }

        let componentes = [];
        const respComp = await fetch('/componente-nota/all');
        if (respComp.ok) {
            const lista = await respComp.json();
            componentes = fk_disciplina ? lista.filter(c => String(c.fk_disciplina_codigo) === String(fk_disciplina)) : lista;
        }

        // 3. Coleta alunos
        let alunos = [];
        const respAlunos = await fetch('/estudante/all');
        if (respAlunos.ok) {
            alunos = await respAlunos.json();
        }

        // 4. Percorre tabela e coleta notas
        const tbody = document.querySelector('.itensNotas tbody');
        if (!tbody) {
            alert('Erro ao acessar a tabela de notas.');
            if (load) load.style.display = 'none';
            return;
        }

        const linhas = tbody.querySelectorAll('tr');
        let notasParaSalvar = [];

        linhas.forEach((linha, indexLinha) => {
            const raCell = linha.querySelector('.raTable');
            const inputs = linha.querySelectorAll('.input-nota');

            if (raCell && inputs.length > 0) {
                const ra = parseInt(raCell.innerText.trim());
                const aluno = alunos.find(a => a.ra === ra);

                if (aluno) {
                    inputs.forEach((input, indexComp) => {
                        const valor = input.value.trim();
                        if (valor && !isNaN(parseFloat(valor))) {
                            const fk_id_componente = componentes[indexComp]?.id_componente;
                            if (fk_id_componente) {
                                notasParaSalvar.push({
                                    fk_id_componente,
                                    fk_id_estudante: ra,
                                    fk_id_turma: id_turma,
                                    valor_nota: parseFloat(valor.replace(',', '.'))
                                });
                            }
                        }
                    });
                }
            }
        });

        // 5. Envia notas
        if (notasParaSalvar.length === 0) {
            alert('Nenhuma nota para salvar.');
            if (load) load.style.display = 'none';
            return;
        }

        let sucessos = 0;
        let erros = 0;

        for (const nota of notasParaSalvar) {
            try {
                const resp = await fetch('/nota/cadastro', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(nota)
                });

                if (resp.ok) {
                    sucessos++;
                } else {
                    erros++;
                    console.warn(`Erro ao salvar nota: RA ${nota.fk_id_estudante}`);
                }
            } catch (e) {
                erros++;
                console.error('Erro na requisição:', e);
            }
        }

        // 6. Desativa modo edição
        const oneEditComp = document.getElementById('oneEditComp');
        const inputs = document.querySelectorAll('.input-nota');
        inputs.forEach(input => {
            input.disabled = true;
            input.style.backgroundColor = 'var(--lightgrey)';
            input.style.cursor = 'not-allowed';
        });
        oneEditComp.style.background = 'var(--white)';
        oneEditComp.style.color = 'var(--black)';
        oneEditComp.style.border = '1px solid var(--lightgrey)';

        alert(`Notas salvas!\\n✅ Sucessos: ${sucessos}\\n❌ Erros: ${erros}`);

    } catch (error) {
        console.error('Erro ao salvar notas:', error);
        alert('Erro ao salvar notas. Veja o console.');
    } finally {
        if (load) load.style.display = 'none';
    }
}