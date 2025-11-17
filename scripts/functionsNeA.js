// Variável de controle para saber se estamos criando ou editando
let isEditing = false;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Carrega a lista inicial
    listarAlunos();

    // 2. Configura o botão de salvar (Cadastrar ou Atualizar)
    const btnSalvar = document.getElementById('btnSaveCA');
    if (btnSalvar) {
        btnSalvar.addEventListener('click', handleSaveButton);
    }

    // 3. Configura o botão de cancelar
    const btnCancel = document.getElementById('btnCancelCA');
    if (btnCancel) {
        btnCancel.addEventListener('click', limparFormulario);
    }

    // 4. Configura a barra de pesquisa
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keyup', filtrarAlunos);
    }
});

// ============================================================
// FUNÇÃO PRINCIPAL: LISTAR ALUNOS
// ============================================================
async function listarAlunos() {
    try {
        const response = await fetch('/estudante/all'); //
        const alunos = await response.json();

        const listaAlunos = document.querySelector('.itemThree ul'); //
        const contadorAlunos = document.getElementById('alunosCount');
        
        listaAlunos.innerHTML = ''; // Limpa a lista antes de renderizar

        if (Array.isArray(alunos)) {
            if (contadorAlunos) contadorAlunos.innerText = alunos.length;

            alunos.forEach(aluno => {
                // Gera iniciais (Ex: Cezar Rull -> CR)
                const iniciais = aluno.nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

                const li = document.createElement('li');
                
                // Estrutura HTML do item da lista
                li.innerHTML = `
                    <a href="#" class="item-aluno">
                        <div class="raAluno">${aluno.ra}</div>
                        <div class="nameAluno">${aluno.nome}</div>
                        <div class="iconAluno">${iniciais}</div>
                    </a>
                    <div class="infoAluno" style="display: none;">
                        <div class="info-content">
                            <p><strong>Ações para:</strong> ${aluno.nome}</p>
                            <div class="info-actions">
                                <button onclick="prepararEdicao(${aluno.ra}, '${aluno.nome}')" class="editAluno">
                                    <i class="ph ph-pencil-simple"></i> Editar
                                </button>
                                <button onclick="deletarAluno(${aluno.ra})" class="deletAluno">
                                    <i class="ph ph-trash"></i> Excluir
                                </button>
                            </div>
                        </div>
                    </div>
                `;

                // Adiciona evento de clique para abrir/fechar (Accordion)
                const linkClick = li.querySelector('.item-aluno');
                const infoDiv = li.querySelector('.infoAluno');

                linkClick.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    // Fecha todos os outros antes de abrir este
                    document.querySelectorAll('.infoAluno').forEach(div => {
                        if (div !== infoDiv) div.style.display = 'none';
                    });

                    // Alterna a visualização deste item
                    infoDiv.style.display = (infoDiv.style.display === 'none') ? 'block' : 'none';
                });

                listaAlunos.appendChild(li);
            });
        }
    } catch (error) {
        console.error("Erro ao listar alunos:", error);
    }
}

// ============================================================
// FUNÇÃO GERENCIADORA DO BOTÃO SALVAR
// ============================================================
async function handleSaveButton() {
    const raInput = document.getElementById('raAluno');
    const nomeInput = document.getElementById('nameAluno');
    
    const ra = parseInt(raInput.value.trim());
    const nome = nomeInput.value.trim();

    if (!ra || !nome) {
        alert("Por favor, preencha o RA e o Nome.");
        return;
    }

    if (isEditing) {
        await atualizarAluno(ra, nome);
    } else {
        await cadastrarAluno(ra, nome);
    }
}

// ============================================================
// CADASTRO (CREATE)
// ============================================================
async function cadastrarAluno(ra, nome) {
    const load = document.querySelector('.load');
    if (load) load.style.display = 'flex'; // Mostra loading

    try {
        // 1. Verifica Duplicidade
        const checkResponse = await fetch('/estudante/verificar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ra: ra })
        });
        const checkResult = await checkResponse.json();

        if (checkResult.sucesso === false) { // Aluno já existe
                // Aluno já existe localmente — não recria, mas segue para matricular na turma atual
                console.log(`ℹ️ Estudante com RA ${ra} já existe:`, checkResult.estudante);
                if (load) load.style.display = 'none';
                // Prossegue para matricular o aluno existente
                await matricularAluno(ra);
                return;
        }

        // 2. Realiza o Cadastro
        const response = await fetch('/estudante/cadastro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ra: ra, nome: nome })
        });

        if (response.ok) {
            alert('Aluno cadastrado com sucesso!');
            limparFormulario();
            listarAlunos(); // Atualiza a tabela
            // Depois de criar o estudante, matricula-o na turma atual
            await matricularAluno(ra);
        } else {
            const errorData = await response.json();
            alert('Erro ao cadastrar: ' + errorData.error);
        }

    } catch (error) {
        console.error(error);
        alert('Erro de conexão.');
    } finally {
        if (load) load.style.display = 'none';
    }
}

// ============================================================
// EDIÇÃO (UPDATE)
// ============================================================
function prepararEdicao(ra, nome) {
    // Preenche o formulário com os dados do aluno selecionado
    const raInput = document.getElementById('raAluno');
    const nomeInput = document.getElementById('nameAluno');
    const btnSalvar = document.getElementById('btnSaveCA');
    const titulo = document.querySelector('.headerCA h2'); // Título "Cadastre Alunos"

    raInput.value = ra;
    nomeInput.value = nome;
    
    // Bloqueia o RA pois é a chave primária (não editável facilmente)
    raInput.disabled = true; 
    raInput.style.backgroundColor = "#e0e0e0";

    // Muda estado visual
    isEditing = true;
    if (titulo) titulo.innerText = "Editar Aluno";
    if (btnSalvar) btnSalvar.innerText = "Atualizar";

    // Rola a página para o topo (formulário)
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function atualizarAluno(ra, nome) {
    const load = document.querySelector('.load');
    if (load) load.style.display = 'flex';

    try {
        //
        const response = await fetch('/estudante/atualizar', {
            method: 'POST', // O seu backend espera POST para atualizar
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ra: ra, nome: nome })
        });

        if (response.ok) {
            alert('Aluno atualizado com sucesso!');
            limparFormulario();
            listarAlunos();
            // Após atualizar, tenta matricular o aluno na turma atual
            await matricularAluno(ra);
        } else {
            alert('Erro ao atualizar.');
        }
    } catch (error) {
        console.error(error);
        alert('Erro de conexão.');
    } finally {
        if (load) load.style.display = 'none';
    }
}

// ============================================================
// MATRÍCULA
// ============================================================
async function matricularAluno(ra) {
    const load = document.querySelector('.load');
    if (load) load.style.display = 'flex';

    try {
        // 1. Identifica a turma atual pela classe 'turmaLogin' (usa o texto)
        const turmaEl = document.querySelector('.turmaLogin');
        if (!turmaEl) {
            alert('Não foi possível identificar a turma atual (elemento .turmaLogin não encontrado).');
            return;
        }

        const turmaNome = turmaEl.textContent.trim();

        // 2. Busca todas as turmas e tenta encontrar a que possui o mesmo nome
        const respTurmas = await fetch('/turma/all');
        if (!respTurmas.ok) {
            console.error('Erro ao obter turmas:', respTurmas.status);
            alert('Erro ao buscar turmas no servidor.');
            return;
        }

        const turmas = await respTurmas.json();
        const listaTurmas = Array.isArray(turmas) ? turmas : (turmas.turmas || []);

        // Tenta achar correspondência exata, senão por inclusão
        let turmaObj = listaTurmas.find(t => (t.nome && t.nome.trim() === turmaNome));
        if (!turmaObj) {
            turmaObj = listaTurmas.find(t => (t.nome && turmaNome.includes(t.nome)) || (t.nome && t.nome.includes(turmaNome)));
        }

        if (!turmaObj) {
            alert(`Turma com nome "${turmaNome}" não encontrada no servidor.`);
            return;
        }

        const fk_id_turma = Number(turmaObj.id);
        const fk_id_estudante = Number(ra);

        // 3. Verifica se matrícula já existe
        const verifyResp = await fetch('/matricula/verificar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fk_id_turma, fk_id_estudante })
        });

        if (!verifyResp.ok) {
            const err = await verifyResp.json().catch(() => ({}));
            console.error('Erro ao verificar matrícula:', verifyResp.status, err);
            alert('Erro ao verificar matrícula.');
            return;
        }

        const verifyData = await verifyResp.json();
        if (verifyData.sucesso === false) {
            alert('Aluno já matriculado nesta turma.');
            return;
        }

        // 4. Cadastra a matrícula
        const cadastroResp = await fetch('/matricula/cadastro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fk_id_turma, fk_id_estudante })
        });

        if (cadastroResp.ok) {
            const data = await cadastroResp.json();
            alert('Matrícula realizada com sucesso! ID: ' + (data.id_matricula || data.id || '---'));
        } else if (cadastroResp.status === 409) {
            const d = await cadastroResp.json().catch(() => ({}));
            alert(d.message || 'Matrícula já existe.');
        } else {
            const d = await cadastroResp.json().catch(() => ({}));
            console.error('Erro ao cadastrar matrícula:', cadastroResp.status, d);
            alert('Erro ao cadastrar matrícula.');
        }

    } catch (error) {
        console.error('Erro na matrícula:', error);
        alert('Erro ao realizar matrícula.');
    } finally {
        if (load) load.style.display = 'none';
    }
}

// ============================================================
// EXCLUSÃO (DELETE)
// ============================================================
async function deletarAluno(ra) {
    if (!confirm(`Tem certeza que deseja excluir o aluno com RA ${ra}?`)) {
        return;
    }

    const load = document.querySelector('.load');
    if (load) load.style.display = 'flex';

    try {
        //
        const response = await fetch('/estudante/deletar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ra: ra })
        });

        if (response.ok) {
            alert('Aluno excluído com sucesso.');
            listarAlunos();
        } else {
            alert('Erro ao excluir aluno.');
        }
    } catch (error) {
        console.error(error);
    } finally {
        if (load) load.style.display = 'none';
    }
}

// ============================================================
// UTILITÁRIOS
// ============================================================
function limparFormulario() {
    const raInput = document.getElementById('raAluno');
    const nomeInput = document.getElementById('nameAluno');
    const btnSalvar = document.getElementById('btnSaveCA');
    const titulo = document.querySelector('.headerCA h2');

    raInput.value = '';
    nomeInput.value = '';
    
    // Restaura estado original (Modo Cadastro)
    raInput.disabled = false;
    raInput.style.backgroundColor = "";
    isEditing = false;
    
    if (titulo) titulo.innerText = "Cadastre Alunos";
    if (btnSalvar) btnSalvar.innerText = "Salvar";
}

function filtrarAlunos() {
    const termo = document.getElementById('searchInput').value.toLowerCase();
    const itens = document.querySelectorAll('.itemThree ul li');

    itens.forEach(item => {
        const nome = item.querySelector('.nameAluno').innerText.toLowerCase();
        const ra = item.querySelector('.raAluno').innerText;
        
        if (nome.includes(termo) || ra.includes(termo)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}

/*////////////////////////////////////////
//       importação aluno csv           //
////////////////////////////////////////*/

