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
    
    // 5. Configura botões de Componentes de Nota (Adicionar / Cancelar / Salvar)
    const btnAddComp = document.querySelector('.btnAddComp');
    const addComponents = document.querySelector('.addComponents');
    const btnCancelComp = document.getElementById('cancelComp');
    const btnSaveComp = document.getElementById('saveComp');

    if (btnAddComp && addComponents) {
        btnAddComp.addEventListener('click', (e) => {
            e.preventDefault();
            addComponents.style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    if (btnCancelComp && addComponents) {
        btnCancelComp.addEventListener('click', (e) => {
            e.preventDefault();
            addComponents.style.display = 'none';
            limparFormularioComponente();
        });
    }

    if (btnSaveComp) {
        btnSaveComp.addEventListener('click', async (e) => {
            e.preventDefault();
            await cadastrarComponente();
        });
    }

    // Carrega a lista de componentes ao iniciar a página
    listarComponentes();
    // Carrega a tabela de notas dinâmica
    carregarTabelaNotas();
});

// ============================================================
// TABELA DE NOTAS DINÂMICA
// ============================================================
async function carregarTabelaNotas() {
    const tabela = document.querySelector('.itensNotas table');
    if (!tabela) return;

    // Busca componentes de nota da disciplina da turma atual
    const turmaEl = document.querySelector('.tumaLogin') || document.querySelector('.turmaLogin');
    const turmaNome = turmaEl ? turmaEl.innerText.trim() : null;

    // Busca turmas para pegar fk_disciplina_codigo
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

    // Busca componentes
    let componentes = [];
    const respComp = await fetch('/componente-nota/all');
    if (respComp.ok) {
        const lista = await respComp.json();
        componentes = fk_disciplina ? lista.filter(c => String(c.fk_disciplina_codigo) === String(fk_disciplina)) : lista;
    }

    // Busca alunos
    let alunos = [];
    const respAlunos = await fetch('/estudante/all');
    if (respAlunos.ok) {
        alunos = await respAlunos.json();
    }

    // Monta o thead
    const thead = tabela.querySelector('thead');
    if (thead) {
        let ths = '<tr>';
        ths += '<th>RA</th>';
        ths += '<th>Nome</th>';
        componentes.forEach(comp => {
            ths += `<th class="siglaProvaTable">${comp.sigla || comp.nome}</th>`;
        });
        ths += '<th class="siglaProvaTable">Média</th>';
        ths += '</tr>';
        thead.innerHTML = ths;
    }

    // Monta o tbody
    const tbody = tabela.querySelector('tbody');
    if (tbody) {
        let trs = '';
        alunos.forEach(aluno => {
            trs += '<tr>';
            trs += `<td class="raTable">${aluno.ra}</td>`;
            trs += `<td class="nameTable">${aluno.nome}</td>`;
            componentes.forEach(comp => {
                trs += `<td class="notaSiglaTable"><input type="text" class="input-nota" data-id-componente="${comp.id_componente}" data-id-estudante="${aluno.ra}" placeholder="-" step="0.1" min="0" max="10" disabled></td>`;
            });
            trs += '<td class="notaSiglaTable mediaNotaTable"></td>';
            trs += '</tr>';
        });
        tbody.innerHTML = trs;
    }

    // Carrega notas existentes do banco de dados
    await carregarNotasExistentes();
}

// ============================================================
// CARREGAR NOTAS EXISTENTES DO BANCO DE DADOS
// ============================================================
async function carregarNotasExistentes() {
    try {
        const respNotas = await fetch('/nota/all');
        if (!respNotas.ok) {
            console.warn('Erro ao buscar notas:', respNotas.statusText);
            return;
        }

        const notas = await respNotas.json();
        if (!Array.isArray(notas)) {
            console.warn('Resposta de notas não é um array');
            return;
        }

        // Percorre as notas e preenche os inputs correspondentes
        notas.forEach(nota => {
            const input = document.querySelector(
                `.input-nota[data-id-componente="${nota.fk_id_componente}"][data-id-estudante="${nota.fk_id_estudante}"]`
            );
            
            if (input) {
                // Converte o valor para formato brasileiro (com vírgula)
                const valorFormatado = String(nota.valor_nota).replace('.', ',');
                input.value = valorFormatado;
            }
        });

        // Recalcula as médias depois de carregar as notas
        const tbody = document.querySelector('.itensNotas tbody');
        if (tbody) {
            const linhas = tbody.querySelectorAll('tr');
            linhas.forEach(linha => {
                calcularMedia(linha);
            });
        }
    } catch (error) {
        console.error('Erro ao carregar notas existentes:', error);
    }
}
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
// COMPONENTES DE NOTA (FRONT-END)
// ============================================================
function limparFormularioComponente() {
    const provaName = document.getElementById('provaName');
    const siglaPR = document.getElementById('siglaPR');
    const descricaoPR = document.getElementById('descricaoPR');

    if (provaName) provaName.value = '';
    if (siglaPR) siglaPR.value = '';
    if (descricaoPR) descricaoPR.value = '';
}

async function cadastrarComponente() {
    const provaNameEl = document.getElementById('provaName');
    const siglaEl = document.getElementById('siglaPR');
    const descricaoEl = document.getElementById('descricaoPR');

    const nome = provaNameEl ? provaNameEl.value.trim() : '';
    const sigla = siglaEl ? siglaEl.value.trim() : '';
    const descricao = descricaoEl ? descricaoEl.value.trim() : '';

    if (!nome) {
        mostrarAlerta('Por favor, informe o nome do componente.', 'warning');
        return;
    }

    const load = document.querySelector('.load');
    if (load) load.style.display = 'flex';

    try {
        // Identifica a turma atual para descobrir a disciplina
        const turmaEl = document.querySelector('.tumaLogin') || document.querySelector('.turmaLogin');
        if (!turmaEl) {
            mostrarAlerta('Não foi possível identificar a turma atual.', 'error');
            return;
        }
        const turmaNome = turmaEl.innerText.trim();

        const respTurmas = await fetch('/turma/all');
        if (!respTurmas.ok) {
            mostrarAlerta('Erro ao buscar turmas no servidor.', 'error');
            return;
        }

        const turmas = await respTurmas.json();
        const listaTurmas = Array.isArray(turmas) ? turmas : (turmas.turmas || []);

        let turmaObj = listaTurmas.find(t => (t.nome && t.nome.trim() === turmaNome));
        if (!turmaObj) {
            turmaObj = listaTurmas.find(t => (t.nome && turmaNome.includes(t.nome)) || (t.nome && t.nome.includes(turmaNome)));
        }

        if (!turmaObj) {
            alert(`Turma "${turmaNome}" não encontrada no servidor.`);
            return;
        }

        const fk_disciplina_codigo = turmaObj.fk_disciplina_codigo || turmaObj.FK_DISCIPLINA_CODIGO || turmaObj.fk_disciplina_codigo;

        // Verifica duplicidade via API
        const checkResp = await fetch('/componente-nota/verificar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fk_disciplina_codigo, nome })
        });

        if (checkResp.ok) {
            const checkData = await checkResp.json();
            if (checkData.sucesso === false) {
                alert('Componente já cadastrado: ' + (checkData.componente?.nome || ''));
                return;
            }
        }

        // Faz o cadastro
        const resp = await fetch('/componente-nota/cadastro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fk_disciplina_codigo, nome, sigla, descricao })
        });

        if (resp.ok) {
            const data = await resp.json();
            alert('Componente cadastrado com sucesso! ID: ' + (data.id_componente || data.id));
            // Fecha formulário e atualiza lista
            const addComponents = document.querySelector('.addComponents');
            if (addComponents) addComponents.style.display = 'none';
            limparFormularioComponente();
            await listarComponentes();
            // Recarrega a tabela de notas com a nova coluna
            await carregarTabelaNotas();
        } else {
            const err = await resp.json().catch(() => ({}));
            alert('Erro ao cadastrar componente: ' + (err.error || resp.status));
        }

    } catch (error) {
        console.error('Erro ao cadastrar componente:', error);
        alert('Erro ao cadastrar componente. Veja console.');
    } finally {
        if (load) load.style.display = 'none';
    }
}

async function listarComponentes() {
    try {
        const view = document.querySelector('.viewDatailsComp');
        const countEl = document.getElementById('countComponents');

        const turmaEl = document.querySelector('.tumaLogin') || document.querySelector('.turmaLogin');
        const turmaNome = turmaEl ? turmaEl.innerText.trim() : null;

        const resp = await fetch('/componente-nota/all');
        if (!resp.ok) return;

        const componentes = await resp.json();
        const lista = Array.isArray(componentes) ? componentes : (componentes.componentes || []);

        // Se tivermos o nome da turma, tenta filtrar pela disciplina desta turma
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

        const filtered = fk_disciplina ? lista.filter(c => String(c.fk_disciplina_codigo) === String(fk_disciplina)) : lista;

        if (countEl) countEl.innerText = filtered.length || 0;

        if (view) {
            view.innerHTML = '';
            filtered.forEach(comp => {
                const div = document.createElement('div');
                div.className = 'detailP';
                const nameP = document.createElement('p');
                nameP.id = 'detailNameP';
                nameP.innerText = comp.nome;
                const sigP = document.createElement('p');
                sigP.id = 'detailSiglaP';
                sigP.innerText = comp.sigla ? `(${comp.sigla})` : '';
                div.appendChild(nameP);
                div.appendChild(sigP);
                view.appendChild(div);
            });
        }
    } catch (error) {
        console.error('Erro ao listar componentes:', error);
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
    const formBody = document.querySelector('.cadastrarAlunoBody');
    
    // 2. Se ele existir, torna visível (block ou flex, dependendo do seu CSS)
    if (formBody) {
        formBody.style.display = 'block'; 
    }
    // Preenche o formulário com os dados do aluno selecionado
    const raInput = document.getElementById('raAluno');
    const nomeInput = document.getElementById('nameAluno');
    const campInputRA = document.querySelector('.campCA');
    const textCampRa = document.querySelector('label[for="raAluno"]');
    const btnSalvar = document.getElementById('btnSaveCA');
    const titulo = document.querySelector('.headerCA h2'); // Título "Cadastre Alunos"

    raInput.value = ra;
    nomeInput.value = nome;
    
    // Bloqueia o RA pois é a chave primária (não editável facilmente)
    raInput.disabled = true; 
    campInputRA.style.border = '1px solid var(--lightgrey)';
    campInputRA.style.background = "var(--lightgrey)";
    textCampRa.innerText = "Campo indisponível para edição";
    textCampRa.style.color = 'var(--grey)';

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
    
    // Adicionado: Seleciona o corpo do formulário
    const formBody = document.querySelector('.cadastrarAlunoBody');

    raInput.value = '';
    nomeInput.value = '';
    
    // Restaura estado original (Modo Cadastro)
    raInput.disabled = false;
    raInput.style.backgroundColor = "";
    
    // Restaura visual do campo RA (bordas e texto originais)
    const campInputRA = document.querySelector('.campCA');
    const textCampRa = document.querySelector('label[for="raAluno"]');
    if (campInputRA) {
        campInputRA.style.border = '';     // Remove estilo inline
        campInputRA.style.background = ''; // Remove estilo inline
    }
    if (textCampRa) {
        textCampRa.innerText = "RA do Aluno"; // Ou o texto original do label
        textCampRa.style.color = '';
    }

    isEditing = false;
    
    if (titulo) titulo.innerText = "Cadastre Alunos";
    if (btnSalvar) btnSalvar.innerText = "Salvar";

    // SE você quiser que o formulário feche ao cancelar, descomente a linha abaixo:
    // if (formBody) formBody.style.display = 'none';
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

document.addEventListener('DOMContentLoaded', () => {
    configurarBotoesImportacao();
});

function configurarBotoesImportacao() {
    const btnImportar = document.querySelector('.btnImportFile');
    const inputFile = document.getElementById('inputFileAlunos');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    const btnCancel = document.querySelector('.btnCancelFile');

    // 1. Feedback visual ao selecionar arquivo
    if (inputFile) {
        inputFile.addEventListener('change', function() {
            if (this.files && this.files.length > 0) {
                if (fileNameDisplay) {
                    fileNameDisplay.innerText = this.files[0].name;
                    fileNameDisplay.style.color = "#333";
                }
            } else {
                if (fileNameDisplay) fileNameDisplay.innerText = "Nenhum arquivo selecionado";
            }
        });
    }

    // 2. Ação do Botão IMPORTAR
    if (btnImportar) {
        btnImportar.addEventListener('click', async (e) => {
            e.preventDefault();
            
            if (!inputFile || !inputFile.files || inputFile.files.length === 0) {
                mostrarAlerta("Por favor, selecione um arquivo CSV.", 'warning');
                return;
            }

            await processarArquivoCSV(inputFile.files[0]);
        });
    }

    // 3. Botão Cancelar
    if (btnCancel) {
        btnCancel.addEventListener('click', (e) => {
            e.preventDefault();
            if (inputFile) inputFile.value = '';
            if (fileNameDisplay) fileNameDisplay.innerText = "Nenhum arquivo selecionado";
            
            const modal = document.querySelector('.fileBody');
            if (modal) modal.style.display = 'none';
        });
    }
}

async function processarArquivoCSV(file) {
    const load = document.querySelector('.load');
    if (load) load.style.display = 'flex';

    try {
        // --- PASSO 1: Identificar a Turma ---
        const turmaEl = document.querySelector('.tumaLogin') || document.querySelector('.turmaLogin');
        if (!turmaEl) throw new Error("Não foi possível identificar a turma na tela.");
        
        const nomeTurmaAtual = turmaEl.innerText.trim();
        
        const respTurmas = await fetch('/turma/all');
        if(!respTurmas.ok) throw new Error("Erro ao buscar turmas.");
        
        const dadosTurmas = await respTurmas.json();
        const listaTurmas = Array.isArray(dadosTurmas) ? dadosTurmas : (dadosTurmas.turmas || []);
        
        const turmaObj = listaTurmas.find(t => t.nome && (t.nome.trim() === nomeTurmaAtual || t.nome.includes(nomeTurmaAtual)));
        
        if (!turmaObj) throw new Error(`Turma "${nomeTurmaAtual}" não encontrada no sistema.`);
        const idTurma = turmaObj.id;

        // --- PASSO 2: Ler e Processar ---
        const texto = await lerArquivo(file);
        const linhas = texto.split('\n');

        let countCriados = 0;
        let countMatriculados = 0;
        let countErros = 0;

        for (let i = 1; i < linhas.length; i++) {
            const linha = linhas[i].trim();
            if (!linha) continue;

            const colunas = linha.includes(';') ? linha.split(';') : linha.split(',');
            
            const ra = colunas[0] ? colunas[0].replace(/["']/g, "").trim() : null;
            const nome = colunas[1] ? colunas[1].replace(/["']/g, "").trim() : null;

            if (ra && nome) {
                const res = await importarUnico(ra, nome, idTurma);
                if (res.sucesso) {
                    if (res.novo) countCriados++;
                    countMatriculados++;
                } else {
                    console.warn(`Falha linha ${i+1}: ${res.msg}`);
                    countErros++;
                }
            }
        }

        // --- PASSO 3: Finalização ---
        mostrarAlerta('Cadastro feito com sucesso', 'success');

        listarAlunos(); 

        // Fecha modal e limpa inputs (CORREÇÃO AQUI: Buscando os elementos novamente)
        const modal = document.querySelector('.fileBody');
        if(modal) modal.style.display = 'none';
        
        const inputEl = document.getElementById('inputFileAlunos');
        if(inputEl) inputEl.value = '';
        
        const displayEl = document.getElementById('fileNameDisplay');
        if(displayEl) displayEl.innerText = "Nenhum arquivo selecionado";

    } catch (erro) {
        console.error(erro);
        alert("Erro na importação: " + erro.message);
    } finally {
        if (load) load.style.display = 'none';
    }
}

function lerArquivo(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
    });
}

async function importarUnico(ra, nome, idTurma) {
    try {
        let novoUsuario = false;

        // 1. Verificar/Criar Estudante
        const check = await fetch('/estudante/verificar', {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ ra: ra })
        });
        const checkData = await check.json();

        if (checkData.sucesso !== false) {
            const create = await fetch('/estudante/cadastro', {
                method: 'POST', headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ ra: ra, nome: nome })
            });
            if (!create.ok) return { sucesso: false, msg: "Erro ao criar estudante" };
            novoUsuario = true;
        }

        // 2. Matricular
        const verMat = await fetch('/matricula/verificar', {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ fk_id_turma: idTurma, fk_id_estudante: ra })
        });
        const verMatData = await verMat.json();

        if (verMatData.sucesso === false) {
            return { sucesso: true, novo: novoUsuario, msg: "Já matriculado" };
        }

        const cadMat = await fetch('/matricula/cadastro', {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ fk_id_turma: idTurma, fk_id_estudante: ra })
        });

        if (cadMat.ok || cadMat.status === 409) {
            return { sucesso: true, novo: novoUsuario };
        } else {
            return { sucesso: false, msg: "Erro ao matricular" };
        }

    } catch (e) {
        return { sucesso: false, msg: e.message };
    }
}