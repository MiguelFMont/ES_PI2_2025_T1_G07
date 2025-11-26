// AUTOR: Cezar Augusto Fernandez Rull - RA: 25007452
// Com o auxílio de: Davi José Bertuolo Vitoreti - RA: 25004168


// Variável de controle para saber se estamos criando ou editando aluno
let isEditing = false;
// Variável de controle para o modo de edição de notas (Cadeado)
let modoEdicaoNotas = false;

document.addEventListener('DOMContentLoaded', () => {

    // ============================================================
    // 1. INICIALIZAÇÃO E CARREGAMENTO DA TURMA
    // ============================================================
    function carregarInformacoesTurma() {
        const turmaJSON = localStorage.getItem("turmaSelecionada");

        if (!turmaJSON) {
            console.warn("⚠️ Nenhuma turma selecionada encontrada!");
            mostrarAlerta("Nenhuma turma foi selecionada. Redirecionando...", "aviso");
            setTimeout(() => {
                window.location.href = "pages/mainPage.html";
            }, 2000);
            return null;
        }

        try {
            const turma = JSON.parse(turmaJSON);
            console.log("✅ Turma carregada:", turma);

            const elementosTurma = document.querySelectorAll('.turmaLogin');
            elementosTurma.forEach(el => {
                el.textContent = turma.nome_turma;
                el.setAttribute('data-turma-id', turma.id);
            });

            const elementosDisciplina = document.querySelectorAll('.disciplinaTurma');
            elementosDisciplina.forEach(el => {
                el.textContent = turma.disciplina ? turma.disciplina.nome : 'Disciplina Desconhecida';
                el.setAttribute('data-disciplina-id', turma.disciplina ? turma.disciplina.codigo : '');
            });

            document.body.setAttribute('data-turma-atual', JSON.stringify(turma));
            return turma;

        } catch (error) {
            console.error("❌ Erro ao carregar turma:", error);
            mostrarAlerta("Erro ao carregar informações da turma", "erro");
            return null;
        }
    }

    const turmaAtual = carregarInformacoesTurma();
    if (!turmaAtual) return;

    // Carrega dados iniciais
    listarAlunos();
    listarComponentes();
    carregarTabelaNotas();

    // ============================================================
    // 2. CONFIGURAÇÃO DE MODAIS E BOTÕES (UI)
    // ============================================================

    // --- Modal Importar Arquivo (.fileBody) ---
    const openFileBody = document.querySelector('.bntFileBody');
    const closedBnt = document.querySelector('.btnCancelFile');
    const closedBntX = document.getElementById('closedFileBody');

    if(openFileBody) openFileBody.addEventListener('click', () => {
        document.querySelector('.fileBody').style.display = 'flex';
    });
    if(closedBnt) closedBnt.addEventListener('click', () => {
        document.querySelector('.fileBody').style.display = 'none';
    });
    if(closedBntX) closedBntX.addEventListener('click', () => {
        document.querySelector('.fileBody').style.display = 'none';
    });

    // --- Modal Cadastrar Aluno (.cadastrarAlunoBody) ---
    const openCABody = document.querySelector('.bntCadastrarAluno');
    const closedCABody = document.getElementById('closedCA');
    const cancelCABody = document.getElementById('btnCancelCA');
    const btnSalvarAluno = document.getElementById('btnSaveCA');

    if(openCABody) openCABody.addEventListener('click', () => {
        document.querySelector('.cadastrarAlunoBody').style.display = 'block';
        limparFormulario(); // Garante que abre limpo
    });
    if(closedCABody) closedCABody.addEventListener('click', () => {
        document.querySelector('.cadastrarAlunoBody').style.display = 'none';
    });
    if(cancelCABody) cancelCABody.addEventListener('click', () => {
        document.querySelector('.cadastrarAlunoBody').style.display = 'none';
        limparFormulario();
    });
    if (btnSalvarAluno) {
        btnSalvarAluno.addEventListener('click', handleSaveButton);
    }

    // --- Pesquisa de Aluno (Animação UI) ---
    const searchInput = document.getElementById('searchInput');
    const alunoSearch = document.getElementById('alunoSearch');
    const moreInfoAluno = document.querySelector('.infoAluno');
    let coutClickAlunoSearch = 0;

    if (searchInput) {
        searchInput.addEventListener('keyup', filtrarAlunos);
    }

    if (alunoSearch && moreInfoAluno) {
        alunoSearch.addEventListener('click', () => {
            // Lógica de animação trazida do notasEalunos.js
            moreInfoAluno.style.display = 'block';
            alunoSearch.style.borderRadius = '1px';
            alunoSearch.style.boxShadow = 'none';
            alunoSearch.style.transform = 'none';
            coutClickAlunoSearch++;

            if(coutClickAlunoSearch == 2) {
                moreInfoAluno.style.display = 'none';
                alunoSearch.style.borderRadius = '50px';
                alunoSearch.style.boxShadow = '0px 6px 5px var(--shadow2)';
                alunoSearch.style.transform = 'scale(1.01)';
                coutClickAlunoSearch = 0;
            }
        });
    }

    // --- Modal Componentes (Adicionar/Listar) ---
    const btnAddComp = document.querySelector('.btnAddComp');
    const addComponentsPanel = document.querySelector('.addComponents');
    const btnCancelComp = document.getElementById('cancelComp');
    const btnSaveComp = document.getElementById('saveComp');

    if (btnAddComp && addComponentsPanel) {
        btnAddComp.addEventListener('click', (e) => {
            // Mescla da lógica: abre o painel
            addComponentsPanel.style.display = 'flex';
            addComponentsPanel.style.flexDirection = 'column';
            addComponentsPanel.style.gap = '20px';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    if (btnCancelComp && addComponentsPanel) {
        btnCancelComp.addEventListener('click', (e) => {
            addComponentsPanel.style.display = 'none';
            limparFormularioComponente();
        });
    }
    if (btnSaveComp) {
        btnSaveComp.addEventListener('click', async (e) => {
            e.preventDefault();
            await cadastrarComponente();
        });
    }

    // ============================================================
    // 3. LÓGICA DE EDIÇÃO DE NOTAS (OneEditComp / AllEditComp)
    // ============================================================
    const oneEditComp = document.getElementById('oneEditComp'); // Botão Cadeado
    const allEditComp = document.getElementById('allEditComp'); // Botão Salvar Notas

    if (oneEditComp) {
        oneEditComp.addEventListener('click', () => {
            if (!modoEdicaoNotas) {
                // ATIVAR MODO EDIÇÃO
                modoEdicaoNotas = true;
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
                // DESATIVAR MODO EDIÇÃO
                modoEdicaoNotas = false;
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
    }

    if (allEditComp) {
        allEditComp.addEventListener('click', async () => {
            if (!modoEdicaoNotas) {
                mostrarAlerta('Ative o modo edição primeiro clicando em "Editar notas".', 'info');
                return;
            }
            await salvarNotas(); // Chama a função vinda do notasEalunos.js
        });
    }

    // ============================================================
    // 4. EVENTOS DA TABELA DE NOTAS (Enter e Blur)
    // ============================================================
    const tabelaBody = document.querySelector('.itensNotas tbody');
    // Usamos delegação de eventos pois a tabela é gerada dinamicamente
    const containerTabela = document.querySelector('.itensNotas');

    if (containerTabela) {
        containerTabela.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && event.target.classList.contains('input-nota')) {
                event.preventDefault(); 
                processarNota(event.target);
                event.target.blur(); // Remove foco
            }
        });

        containerTabela.addEventListener('blur', (event) => {
            if (event.target.classList.contains('input-nota')) {
                processarNota(event.target);
            }
        }, true);
    } else {
        console.warn("AVISO: Tabela '.itensNotas' não encontrada.");
    }

    // ============================================================
    // 5. AÇÕES EM MASSA (Deletar/Exportar Selecionados)
    // ============================================================
    const btnDeletarMass = document.getElementById('deletAlunoSelect');
    const btnExportarMass = document.getElementById('exportarAlunoSelect');

    if (btnDeletarMass) {
        btnDeletarMass.addEventListener('click', (e) => {
            e.preventDefault();
            deletarAlunosSelecionados();
        });
    }
    if (btnExportarMass) {
        btnExportarMass.addEventListener('click', (e) => {
            e.preventDefault();
            exportarAlunosSelecionados();
        });
    }

    // Inicializa botões de importação CSV
    configurarBotoesImportacao();
});


// ============================================================
// FUNÇÕES DE CÁLCULO E PROCESSAMENTO DE NOTAS (Do notasEalunos.js)
// ============================================================

function calcularMedia(row) {
    const inputs = row.querySelectorAll('.input-nota');
    const mediaCell = row.querySelector('.mediaNotaTable');

    if (!mediaCell) {
        // Pode acontecer se a tabela ainda estiver carregando
        return;
    }

    let total = 0;
    let count = 0;
    
    inputs.forEach(input => {
        const notaString = input.value;
        const notaFormatada = notaString.replace(',', '.');
        const notaValor = parseFloat(notaFormatada);

        if (!isNaN(notaValor)) {
            total += notaValor;
            count++; // Conta apenas notas lançadas se quiser média parcial, ou usa inputs.length para média total
        }
    });

    if (inputs.length > 0) {
        // Média aritmética simples baseada no número de inputs (componentes)
        const media = total / inputs.length; 

        mediaCell.textContent = media.toFixed(2).replace('.', ',');

        if (media < 5.0) {
            mediaCell.classList.add('baixa');
            mediaCell.classList.remove('alta');
        } else {
            mediaCell.classList.add('alta');
            mediaCell.classList.remove('baixa');
        }
    } else {
        mediaCell.textContent = "-";
        mediaCell.classList.remove('baixa');
        mediaCell.classList.remove('alta');
    }
}

function processarNota(inputElement) {
    const notaString = inputElement.value;

    if (notaString.trim() === "") {
        inputElement.classList.remove('baixa');
        // Se vazio, apenas recalcula média
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
    
    // Recalcula a média da linha inteira
    const row = inputElement.closest('tr');
    if (row) {
        calcularMedia(row);
    }
}

// ============================================================
// SALVAR NOTAS NO BANCO DE DADOS (Do notasEalunos.js)
// ============================================================
async function salvarNotas() {
    const load = document.querySelector('.load');
    if (load) load.style.display = 'flex';

    try {
        const turmaAtual = obterTurmaAtual();
        if (!turmaAtual) {
            mostrarAlerta('Erro ao identificar a turma.', 'error');
            if (load) load.style.display = 'none';
            return;
        }

        const id_turma = turmaAtual.id;
        const fk_disciplina = turmaAtual.disciplina.codigo;

        // 1. Coleta componentes da disciplina atual
        let componentes = [];
        const respComp = await fetch('/componente-nota/all');
        if (respComp.ok) {
            const lista = await respComp.json();
            componentes = fk_disciplina ? lista.filter(c => String(c.fk_disciplina_codigo) === String(fk_disciplina)) : lista;
        }

        // 2. Percorre tabela e coleta notas para salvar
        const tbody = document.querySelector('.itensNotas tbody');
        if (!tbody) {
            mostrarAlerta('Erro ao acessar a tabela de notas.', 'error');
            if (load) load.style.display = 'none';
            return;
        }

        const linhas = tbody.querySelectorAll('tr');
        let notasParaSalvar = [];

        linhas.forEach((linha) => {
            const raCell = linha.querySelector('.raTable');
            const inputs = linha.querySelectorAll('.input-nota');

            if (raCell && inputs.length > 0) {
                const ra = parseInt(raCell.innerText.trim());

                inputs.forEach((input, indexComp) => {
                    const valor = input.value.trim();
                    // Só salva se houver valor e for numérico
                    if (valor) {
                        const valorFloat = parseFloat(valor.replace(',', '.'));
                        if(!isNaN(valorFloat)) {
                            // Pega o ID do componente via atributo data (mais seguro) ou index
                            const idCompAttr = input.getAttribute('data-id-componente');
                            const fk_id_componente = idCompAttr ? parseInt(idCompAttr) : componentes[indexComp]?.id_componente;

                            if (fk_id_componente) {
                                notasParaSalvar.push({
                                    fk_id_componente,
                                    fk_id_estudante: ra,
                                    fk_id_turma: id_turma,
                                    valor_nota: valorFloat
                                });
                            }
                        }
                    }
                });
            }
        });

        // 3. Envia notas
        if (notasParaSalvar.length === 0) {
            mostrarAlerta('Nenhuma nota preenchida para salvar.', 'info');
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
                    console.warn(`Erro ao salvar nota RA ${nota.fk_id_estudante}`);
                }
            } catch (e) {
                erros++;
                console.error('Erro na requisição:', e);
            }
        }

        // 4. Desativa modo edição após salvar
        const oneEditComp = document.getElementById('oneEditComp');
        const inputs = document.querySelectorAll('.input-nota');
        inputs.forEach(input => {
            input.disabled = true;
            input.style.backgroundColor = 'var(--lightgrey)';
            input.style.cursor = 'not-allowed';
        });
        
        if (oneEditComp) {
            oneEditComp.style.background = 'var(--white)';
            oneEditComp.style.color = 'var(--black)';
            oneEditComp.style.border = '1px solid var(--lightgrey)';
        }
        modoEdicaoNotas = false;

        mostrarAlerta(`Operação concluída!\n✅ Salvas: ${sucessos}\n❌ Falhas: ${erros}`, 'success');

    } catch (error) {
        console.error('Erro ao salvar notas:', error);
        mostrarAlerta('Erro crítico ao salvar notas. Veja o console.', 'error');
    } finally {
        if (load) load.style.display = 'none';
    }
}


// ============================================================
// TABELA DE NOTAS DINÂMICA
// ============================================================

function obterTurmaAtual() {
    const turmaData = document.body.getAttribute('data-turma-atual');
    if (turmaData) {
        try {
            return JSON.parse(turmaData);
        } catch (e) {
            console.error("Erro ao parsear turma atual:", e);
        }
    }
    return null;
}

async function carregarTabelaNotas() {
    const tabela = document.querySelector('.itensNotas table');
    if (!tabela) return;

    const turmaAtual = obterTurmaAtual();
    if (!turmaAtual) {
        console.error("❌ Turma não encontrada no body");
        return;
    }

    const fk_disciplina = turmaAtual.disciplina.codigo;

    // Busca componentes
    let componentes = [];
    const respComp = await fetch('/componente-nota/all');
    if (respComp.ok) {
        const lista = await respComp.json();
        componentes = fk_disciplina
            ? lista.filter(c => String(c.fk_disciplina_codigo) === String(fk_disciplina))
            : lista;
    }

    // Busca alunos MATRICULADOS
    let alunos = [];
    try {
        const respMatriculas = await fetch('/matricula/all');
        if (respMatriculas.ok) {
            const todasMatriculas = await respMatriculas.json();
            const matriculasDaTurma = todasMatriculas.filter(m =>
                String(m.fk_id_turma) === String(turmaAtual.id)
            );

            const respAlunos = await fetch('/estudante/all');
            if (respAlunos.ok) {
                const todosAlunos = await respAlunos.json();
                alunos = todosAlunos.filter(aluno =>
                    matriculasDaTurma.some(m => String(m.fk_id_estudante) === String(aluno.ra))
                );
            }
        }
    } catch (error) {
        console.error("Erro ao buscar alunos matriculados:", error);
    }

    // Monta o thead
    const thead = tabela.querySelector('thead');
    if (thead) {
        let ths = '<tr>';
        ths += '<th>RA</th>';
        ths += '<th>Nome</th>';
        componentes.forEach(comp => {
            ths += `<th class="siglaProvaTable" title="${comp.nome}">${comp.sigla || comp.nome}</th>`;
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
                trs += `<td class="notaSiglaTable">
                            <input type="text" class="input-nota" 
                                data-id-componente="${comp.id_componente}" 
                                data-id-estudante="${aluno.ra}" 
                                placeholder="-" step="0.1" min="0" max="10" disabled>
                        </td>`;
            });
            trs += '<td class="notaSiglaTable mediaNotaTable">-</td>';
            trs += '</tr>';
        });
        tbody.innerHTML = trs;
    }

    // Atualiza contador de alunos
    const contadorAlunos = document.getElementById('alunosCount');
    if (contadorAlunos) {
        contadorAlunos.textContent = alunos.length;
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
        if (!Array.isArray(notas)) return;

        // Percorre as notas e preenche os inputs correspondentes
        notas.forEach(nota => {
            const input = document.querySelector(
                `.input-nota[data-id-componente="${nota.fk_id_componente}"][data-id-estudante="${nota.fk_id_estudante}"]`
            );

            if (input) {
                const valorFormatado = String(nota.valor_nota).replace('.', ',');
                input.value = valorFormatado;
                
                // Aplica formatação visual (vermelho/azul)
                processarNota(input);
            }
        });

        // Recalcula as médias de todas as linhas agora que os dados foram preenchidos
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
// FUNÇÃO PRINCIPAL: LISTAR ALUNOS (NA LISTA LATERAL)
// ============================================================
async function listarAlunos() {
    try {
        const turmaAtual = obterTurmaAtual();
        if (!turmaAtual) return;

        // Busca matrículas da turma atual
        const respMatriculas = await fetch('/matricula/all');
        if (!respMatriculas.ok) return;

        const todasMatriculas = await respMatriculas.json();
        const matriculasDaTurma = todasMatriculas.filter(m =>
            String(m.fk_id_turma) === String(turmaAtual.id)
        );

        const response = await fetch('/estudante/all');
        const todosAlunos = await response.json();

        const alunos = todosAlunos.filter(aluno =>
            matriculasDaTurma.some(m => String(m.fk_id_estudante) === String(aluno.ra))
        );

        const listaAlunos = document.querySelector('.itemThree ul');
        const contadorAlunos = document.getElementById('alunosCount');

        if (listaAlunos) listaAlunos.innerHTML = '';

        if (Array.isArray(alunos)) {
            if (contadorAlunos) contadorAlunos.innerText = alunos.length;

            alunos.forEach(aluno => {
                const iniciais = aluno.nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                const li = document.createElement('li');

                li.innerHTML = `
                    <a href="#" class="item-aluno">
                        <div id="selectAlunoBtn" style="display: none;"></div>
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
                                <button onclick="exportarAlunoIndividual('${aluno.ra}', '${aluno.nome}')" class="exportarAluno">
                                    <i class="ph ph-export"></i> Exportar
                                </button>
                            </div>
                        </div>
                    </div>
                `;

                const linkClick = li.querySelector('.item-aluno');
                const infoDiv = li.querySelector('.infoAluno');
                const selectBtn = li.querySelector('#selectAlunoBtn');

                linkClick.addEventListener('click', (e) => {
                    e.preventDefault();
                    // Verifica se a bolinha está visível (Modo Seleção Ativo)
                    const isSelectionMode = selectBtn.style.display === 'block';

                    if (isSelectionMode) {
                        // MODO SELEÇÃO
                        if (selectBtn.style.background.includes('var(--color5)')) {
                            selectBtn.style.background = ''; 
                            selectBtn.style.border = '1px solid var(--black)'; 
                        } else {
                            selectBtn.style.background = 'var(--color5)'; 
                            selectBtn.style.border = '1px solid var(--color5)'; 
                        }
                        atualizarInterfaceSelecao();
                    } else {
                        // MODO NORMAL: Abre info
                        document.querySelectorAll('.infoAluno').forEach(div => {
                            if (div !== infoDiv) div.style.display = 'none';
                        });
                        infoDiv.style.display = (infoDiv.style.display === 'none') ? 'block' : 'none';
                    }
                });

                if (listaAlunos) listaAlunos.appendChild(li);
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
        const turmaAtual = obterTurmaAtual();
        if (!turmaAtual) {
            mostrarAlerta('Turma não identificada.', 'erro');
            return;
        }

        const fk_disciplina_codigo = turmaAtual.disciplina.codigo;

        // Verifica duplicidade
        const checkResp = await fetch('/componente-nota/verificar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fk_disciplina_codigo, nome })
        });

        if (checkResp.ok) {
            const checkData = await checkResp.json();
            if (checkData.sucesso === false) {
                mostrarAlerta('Componente já cadastrado.', 'aviso');
                return;
            }
        }

        // Cadastro
        const resp = await fetch('/componente-nota/cadastro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fk_disciplina_codigo, nome, sigla, descricao })
        });

        if (resp.ok) {
            mostrarAlerta('Componente cadastrado com sucesso!', 'success');
            const addComponents = document.querySelector('.addComponents');
            if (addComponents) addComponents.style.display = 'none';
            limparFormularioComponente();
            await listarComponentes();
            await carregarTabelaNotas();
        } else {
            mostrarAlerta('Erro ao cadastrar componente.', 'erro');
        }

    } catch (error) {
        console.error('Erro ao cadastrar componente:', error);
        mostrarAlerta('Erro de conexão.', 'erro');
    } finally {
        if (load) load.style.display = 'none';
    }
}

async function listarComponentes() {
    try {
        const view = document.querySelector('.viewDatailsComp');
        const countEl = document.getElementById('countComponents');

        // 1. Obtém a turma atual para saber qual é a disciplina
        const turmaAtual = obterTurmaAtual();
        
        // Se não houver turma ou disciplina definida, limpa a view e retorna
        if (!turmaAtual || !turmaAtual.disciplina) {
            console.warn("Nenhuma disciplina vinculada à turma atual.");
            if (countEl) countEl.innerText = 0;
            if (view) view.innerHTML = '';
            return;
        }

        const fk_disciplina = turmaAtual.disciplina.codigo;

        // 2. Busca TODOS os componentes (conforme rota definida no server.ts)
        const resp = await fetch('/componente-nota/all');

        if (!resp.ok) {
            console.error("Erro ao buscar componentes:", resp.statusText);
            return;
        }

        const lista = await resp.json();

        // 3. Filtra apenas os componentes que pertencem a esta disciplina
        // A propriedade vem do JSON como 'fk_disciplina_codigo' (minúsculo, definido no componente_nota.ts)
        const filtered = lista.filter(c => String(c.fk_disciplina_codigo) === String(fk_disciplina));

        // 4. Atualiza a Interface (Contador e Lista Visual)
        if (countEl) countEl.innerText = filtered.length || 0;

        if (view) {
            view.innerHTML = '';
            if (filtered.length === 0) {
                view.innerHTML = '<p style="padding: 10px; color: #666;">Nenhum componente cadastrado.</p>';
            } else {
                filtered.forEach(comp => {
                    const div = document.createElement('div');
                    div.className = 'detailP';
                    
                    const nameP = document.createElement('p');
                    nameP.className = 'detailNameP'; 
                    nameP.innerText = comp.nome;
                    
                    const sigP = document.createElement('p');
                    sigP.className = 'detailSiglaP'; 
                    // Exibe a sigla se existir
                    sigP.innerText = comp.sigla ? `(${comp.sigla})` : '';
                    
                    div.appendChild(nameP);
                    div.appendChild(sigP);
                    view.appendChild(div);
                });
            }
        }
    } catch (error) {
        console.error('Erro ao listar componentes:', error);
    }
}

// ============================================================
// CRUD ALUNOS (Salvar, Editar, Excluir)
// ============================================================
async function handleSaveButton() {
    const raInput = document.getElementById('raAluno');
    const nomeInput = document.getElementById('nameAluno');

    const ra = parseInt(raInput.value.trim());
    const nome = nomeInput.value.trim();

    if (!ra || !nome) {
        mostrarAlerta("Por favor, preencha o RA e o Nome.", 'aviso');
        return;
    }

    if (isEditing) {
        await atualizarAluno(ra, nome);
    } else {
        await cadastrarAluno(ra, nome);
    }
}

async function cadastrarAluno(ra, nome) {
    const load = document.querySelector('.load');
    if (load) load.style.display = 'flex';

    try {
        const checkResponse = await fetch('/estudante/verificar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ra: ra })
        });
        const checkResult = await checkResponse.json();

        if (checkResult.sucesso === false) { 
            // Já existe, apenas matricula
            if (load) load.style.display = 'none';
            await matricularAluno(ra);
            return;
        }

        const response = await fetch('/estudante/cadastro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ra: ra, nome: nome })
        });

        if (response.ok) {
            mostrarAlerta('Aluno cadastrado com sucesso!', 'success');
            limparFormulario();
            listarAlunos(); 
            await matricularAluno(ra);
        } else {
            const errorData = await response.json();
            mostrarAlerta('Erro ao cadastrar: ' + errorData.error, 'erro');
        }

    } catch (error) {
        console.error(error);
        mostrarAlerta('Erro de conexão.', 'erro');
    } finally {
        if (load) load.style.display = 'none';
    }
}

function prepararEdicao(ra, nome) {
    const formBody = document.querySelector('.cadastrarAlunoBody');
    if (formBody) formBody.style.display = 'block';

    const raInput = document.getElementById('raAluno');
    const nomeInput = document.getElementById('nameAluno');
    const campInputRA = document.querySelector('.campCA');
    const textCampRa = document.querySelector('label[for="raAluno"]');
    const btnSalvar = document.getElementById('btnSaveCA');
    const titulo = document.querySelector('.headerCA h2');

    raInput.value = ra;
    nomeInput.value = nome;
    raInput.disabled = true;
    
    if(campInputRA) {
        campInputRA.style.border = '1px solid var(--lightgrey)';
        campInputRA.style.background = "var(--lightgrey)";
    }
    if(textCampRa) {
        textCampRa.innerText = "Campo indisponível para edição";
        textCampRa.style.color = 'var(--grey)';
    }

    isEditing = true;
    if (titulo) titulo.innerText = "Editar Aluno";
    if (btnSalvar) btnSalvar.innerText = "Atualizar";
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function atualizarAluno(ra, nome) {
    const load = document.querySelector('.load');
    if (load) load.style.display = 'flex';

    try {
        const response = await fetch('/estudante/atualizar', {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ra: ra, nome: nome })
        });

        if (response.ok) {
            mostrarAlerta('Aluno atualizado com sucesso!', 'success');
            limparFormulario();
            listarAlunos();
            await matricularAluno(ra);
        } else {
            mostrarAlerta('Erro ao atualizar.', 'erro');
        }
    } catch (error) {
        console.error(error);
        mostrarAlerta('Erro de conexão.', 'erro');
    } finally {
        if (load) load.style.display = 'none';
    }
}

async function matricularAluno(ra) {
    const load = document.querySelector('.load');
    if (load) load.style.display = 'flex';

    try {
        const turmaAtual = obterTurmaAtual();
        if (!turmaAtual) return;

        const fk_id_turma = Number(turmaAtual.id);
        const fk_id_estudante = Number(ra);

        const verifyResp = await fetch('/matricula/verificar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fk_id_turma, fk_id_estudante })
        });
        const verifyData = await verifyResp.json();
        
        if (verifyData.sucesso === false) {
            mostrarAlerta('Aluno já matriculado nesta turma.', 'aviso');
            return;
        }

        const cadastroResp = await fetch('/matricula/cadastro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fk_id_turma, fk_id_estudante })
        });

        if (cadastroResp.ok) {
            mostrarAlerta('Matrícula realizada com sucesso!', 'success');
            await listarAlunos();
            await carregarTabelaNotas();
        } else if (cadastroResp.status === 409) {
            mostrarAlerta('Matrícula já existe.', 'aviso');
        } else {
            mostrarAlerta('Erro ao cadastrar matrícula.', 'erro');
        }

    } catch (error) {
        console.error('Erro na matrícula:', error);
    } finally {
        if (load) load.style.display = 'none';
    }
}

async function deletarAluno(ra) {
    mostrarConfirm(`Tem certeza que deseja excluir o aluno com RA ${ra}?`, async (confirmado) => {
        if (confirmado) {
            const load = document.querySelector('.load');
            if (load) load.style.display = 'flex';

            try {
                const response = await fetch('/estudante/deletar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ra: ra })
                });

                if (response.ok) {
                    mostrarAlerta('Aluno excluído com sucesso.');
                    listarAlunos();
                    await carregarTabelaNotas(); 
                } else {
                    mostrarAlerta('Erro ao excluir aluno.');
                }
            } catch (error) {
                console.error(error);
            } finally {
                if (load) load.style.display = 'none';
            }
        }
    });
}

// ===============================
// DELETAR COMPONENTE DE NOTA
// ===============================
document.addEventListener('DOMContentLoaded', () => {
    const btnDeleteComp = document.querySelector('.btnDeteleComp');
    const deleteCompBody = document.querySelector('.deleteCompBody');
    const closedDeleteComp = document.getElementById('closedDeleteComp');
    const cancelDeleteComp = document.getElementById('cancelDeleteComp');
    const confirmDeleteComp = document.getElementById('confirmDeleteComp');
    const selectCompToDelete = document.getElementById('selectCompToDelete');

    if (btnDeleteComp && deleteCompBody) {
        btnDeleteComp.addEventListener('click', async () => {
            deleteCompBody.style.display = 'flex';
            await carregarComponentesNoSelect();
        });
    }
    if (closedDeleteComp) {
        closedDeleteComp.addEventListener('click', () => {
            deleteCompBody.style.display = 'none';
        });
    }
    if (cancelDeleteComp) {
        cancelDeleteComp.addEventListener('click', () => {
            deleteCompBody.style.display = 'none';
        });
    }
    if (confirmDeleteComp) {
        confirmDeleteComp.addEventListener('click', async () => {
            const idComp = selectCompToDelete.value;
            if (!idComp) {
                mostrarAlerta('Selecione um componente para deletar.');
                return;
            }
            mostrarConfirm('Tem certeza que deseja deletar este componente? Todas as notas associadas serão removidas!', async (confirmado) => {
                if (confirmado) {
                    const load = document.querySelector('.load');
                    if (load) load.style.display = 'flex';
                    try {
                        const resp = await fetch('/componente-nota/deletar', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id_componente: idComp })
                        });
                        if (resp.ok) {
                            mostrarAlerta('Componente deletado com sucesso!');
                            deleteCompBody.style.display = 'none';
                            await listarComponentes();
                            await carregarTabelaNotas();
                        } else {
                            mostrarAlerta('Erro ao deletar componente.');
                        }
                    } catch (error) {
                        mostrarAlerta('Erro na requisição.');
                    } finally {
                        if (load) load.style.display = 'none';
                    }
                }
            });
        });
    }

    async function carregarComponentesNoSelect() {
        if(!selectCompToDelete) return;
        selectCompToDelete.innerHTML = '<option value="">Carregando...</option>';
        try {
            const turmaAtual = obterTurmaAtual();
            let fk_disciplina = turmaAtual ? turmaAtual.disciplina.codigo : null;

            const resp = await fetch('/componente-nota/all');
            if (resp.ok) {
                const lista = await resp.json();
                let componentesFiltrados = lista;
                if (fk_disciplina) {
                    componentesFiltrados = lista.filter(c => String(c.fk_disciplina_codigo) === String(fk_disciplina));
                }

                if (Array.isArray(componentesFiltrados) && componentesFiltrados.length > 0) {
                    selectCompToDelete.innerHTML = componentesFiltrados.map(comp =>
                        `<option value="${comp.id_componente}">${comp.sigla ? comp.sigla : comp.nome}</option>`
                    ).join('');
                } else {
                    selectCompToDelete.innerHTML = '<option value="">Nenhum componente cadastrado</option>';
                }
            } else {
                selectCompToDelete.innerHTML = '<option value="">Erro ao carregar</option>';
            }
        } catch (error) {
            console.error('Erro ao carregar componentes:', error);
        }
    }
});

// ============================================================
// UTILITÁRIOS (Limpar form, Filtrar)
// ============================================================
function limparFormulario() {
    const raInput = document.getElementById('raAluno');
    const nomeInput = document.getElementById('nameAluno');
    const btnSalvar = document.getElementById('btnSaveCA');
    const titulo = document.querySelector('.headerCA h2');

    if(raInput) {
        raInput.value = '';
        raInput.disabled = false;
        raInput.style.backgroundColor = "";
    }
    if(nomeInput) nomeInput.value = '';

    const campInputRA = document.querySelector('.campCA');
    const textCampRa = document.querySelector('label[for="raAluno"]');
    if (campInputRA) {
        campInputRA.style.border = '';     
        campInputRA.style.background = ''; 
    }
    if (textCampRa) {
        textCampRa.innerText = "RA do Aluno";
        textCampRa.style.color = '';
    }

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

// ============================================================
// IMPORTAÇÃO CSV
// ============================================================
function configurarBotoesImportacao() {
    const btnImportar = document.querySelector('.btnImportFile');
    const inputFile = document.getElementById('inputFileAlunos');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    const btnCancel = document.querySelector('.btnCancelFile');

    if (inputFile) {
        inputFile.addEventListener('change', function () {
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
        const turmaAtual = obterTurmaAtual();
        if (!turmaAtual) throw new Error("Não foi possível identificar a turma.");
        const idTurma = turmaAtual.id;

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
                    console.warn(`Falha linha ${i + 1}: ${res.msg}`);
                    countErros++;
                }
            }
        }

        mostrarAlerta('Importação concluída! A página será recarregada...', 'success');
        const modal = document.querySelector('.fileBody');
        if (modal) modal.style.display = 'none';

        setTimeout(() => {
            window.location.reload();
        }, 1500);

    } catch (erro) {
        console.error(erro);
        mostrarAlerta("Erro na importação: " + erro.message, 'erro');
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
        const check = await fetch('/estudante/verificar', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ra: ra })
        });
        const checkData = await check.json();

        if (checkData.sucesso !== false) {
            const create = await fetch('/estudante/cadastro', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ra: ra, nome: nome })
            });
            if (!create.ok) return { sucesso: false, msg: "Erro ao criar estudante" };
            novoUsuario = true;
        }

        const verMat = await fetch('/matricula/verificar', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fk_id_turma: idTurma, fk_id_estudante: ra })
        });
        const verMatData = await verMat.json();

        if (verMatData.sucesso === false) {
            return { sucesso: true, novo: novoUsuario, msg: "Já matriculado" };
        }

        const cadMat = await fetch('/matricula/cadastro', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
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

// ============================================================
// LÓGICA DE SELEÇÃO E EXPORTAÇÃO
// ============================================================
const openClosedSelectAlunos = document.getElementById('btnOptionsSelectA');
const optionsSelect = document.querySelector('.optionsSelect');
const bodySelect = document.querySelector('.selectAlunos');
const btnCancelSelection = document.getElementById('cancelSelection');
let countSelect = 0;

function atualizarInterfaceSelecao() {
    const allSelectBtns = document.querySelectorAll('#selectAlunoBtn');
    let count = 0;

    allSelectBtns.forEach(btn => {
        if (btn.style.background.includes('var(--color5)')) {
            count++;
        }
    });

    const spanContador = document.querySelector('.countAlunosSelect span');
    if (spanContador) spanContador.innerText = count;

    const menuOptionsAluno = document.querySelector('.menuOptionsAluno');
    if (menuOptionsAluno) {
        menuOptionsAluno.style.display = (count > 0) ? 'flex' : 'none';
    }
}

function obterAlunosSelecionados() {
    const selecionados = [];
    const itens = document.querySelectorAll('.itemThree ul li');

    itens.forEach(li => {
        const btn = li.querySelector('#selectAlunoBtn');
        if (btn && btn.style.background.includes('var(--color5)')) {
            const raEl = li.querySelector('.raAluno');
            const nomeEl = li.querySelector('.nameAluno');
            if (raEl && nomeEl) {
                selecionados.push({
                    ra: raEl.innerText.trim(),
                    nome: nomeEl.innerText.trim()
                });
            }
        }
    });
    return selecionados;
}

function isAlgumSelecionado() {
    const allSelectBtns = document.querySelectorAll('#selectAlunoBtn');
    return Array.from(allSelectBtns).some(btn => btn.style.background.includes('var(--color5)'));
}

function sairDoModoSelecao() {
    const allSelectBtns = document.querySelectorAll('#selectAlunoBtn');
    allSelectBtns.forEach(btn => {
        btn.style.display = 'none';
        btn.style.background = '';
        btn.style.border = '1px solid var(--black)';
    });
    atualizarInterfaceSelecao();
}

function fecharMenuSelecao() {
    if (optionsSelect && bodySelect) {
        optionsSelect.style.display = 'none';
        bodySelect.style.height = 'min-content';
        countSelect = 0;
    }
}

if (openClosedSelectAlunos) {
    openClosedSelectAlunos.addEventListener('click', () => {
        if (countSelect === 0) {
            if (!isAlgumSelecionado()) sairDoModoSelecao();

            const temSelecao = isAlgumSelecionado();
            if (temSelecao) {
                if (btnCancelSelection) btnCancelSelection.style.display = 'block';
                bodySelect.style.height = '150px';
            } else {
                if (btnCancelSelection) btnCancelSelection.style.display = 'none';
                bodySelect.style.height = '110px';
            }
            optionsSelect.style.display = 'flex';
            countSelect++;
        } else {
            fecharMenuSelecao();
        }
    });
}

const btnSelecionarOne = document.getElementById('selecionarOne');
if (btnSelecionarOne) {
    btnSelecionarOne.addEventListener('click', (e) => {
        e.preventDefault();
        const allSelectBtns = document.querySelectorAll('#selectAlunoBtn');
        allSelectBtns.forEach(btn => {
            btn.style.display = 'block'; 
            btn.style.background = ''; 
            btn.style.border = '1px solid var(--black)';
        });
        fecharMenuSelecao();
        atualizarInterfaceSelecao();
    });
}

const btnSelecionarAll = document.getElementById('selecionarAll');
if (btnSelecionarAll) {
    btnSelecionarAll.addEventListener('click', (e) => {
        e.preventDefault();
        const allSelectBtns = document.querySelectorAll('#selectAlunoBtn');
        allSelectBtns.forEach(btn => {
            btn.style.display = 'block';
            btn.style.background = 'var(--color5)';
            btn.style.border = '1px solid var(--color5)';
        });
        fecharMenuSelecao();
        atualizarInterfaceSelecao();
    });
}

if (btnCancelSelection) {
    btnCancelSelection.addEventListener('click', (e) => {
        e.preventDefault();
        sairDoModoSelecao();
        fecharMenuSelecao();
    });
}

// ============================================================
// EXPORTAÇÃO
// ============================================================
async function exportarAlunoIndividual(ra, nome) {
    const load = document.querySelector('.load');
    if (load) load.style.display = 'flex';

    try {
        const turmaAtual = obterTurmaAtual();
        if (!turmaAtual) throw new Error("Info turma erro");
        
        const fk_disciplina = turmaAtual.disciplina.codigo;

        const respComp = await fetch('/componente-nota/all');
        const allComps = await respComp.json();
        const componentesDaTurma = allComps.filter(c => String(c.fk_disciplina_codigo) === String(fk_disciplina));

        const respNotas = await fetch('/nota/all');
        const todasAsNotas = await respNotas.json();

        let headerCSV = "RA;Nome";
        let linhaDados = `${ra};${nome}`;
        let somaNotas = 0;
        let qtdNotasComputadas = 0;
        let temNotaFaltante = false;

        for (const comp of componentesDaTurma) {
            headerCSV += `;${comp.sigla || comp.nome}`;
            const notaEncontrada = todasAsNotas.find(n => 
                String(n.fk_id_estudante) === String(ra) && 
                String(n.fk_id_componente) === String(comp.id_componente)
            );

            if (notaEncontrada) {
                const valorFormatado = String(notaEncontrada.valor_nota).replace('.', ',');
                linhaDados += `;${valorFormatado}`;
                somaNotas += Number(notaEncontrada.valor_nota);
                qtdNotasComputadas++;
            } else {
                temNotaFaltante = true;
                break; 
            }
        }

        if (temNotaFaltante) {
            if (load) load.style.display = 'none';
            mostrarAlerta("Aluno sem nota(s) lançada(s). Exportação cancelada.", "aviso");
            return;
        }

        let mediaFinal = 0;
        if (qtdNotasComputadas > 0) {
            mediaFinal = (somaNotas / qtdNotasComputadas).toFixed(1);
        }

        headerCSV += ";Média";
        linhaDados += `;${String(mediaFinal).replace('.', ',')}`;

        let csvContent = `${headerCSV}\n${linhaDados}`;
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' }); 
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const nomeArquivo = nome.replace(/\s+/g, '_').trim(); 
        
        link.setAttribute("href", url);
        link.setAttribute("download", `Relatorio_${nomeArquivo}_${ra}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

    } catch (error) {
        console.error("Erro na exportação:", error);
        mostrarAlerta("Erro ao exportar dados do aluno.", "erro");
    } finally {
        if (load) load.style.display = 'none';
    }
}

async function deletarAlunosSelecionados() {
    const listaAlunos = obterAlunosSelecionados();
    if (listaAlunos.length === 0) {
        mostrarAlerta("Nenhum aluno selecionado.", "aviso");
        return;
    }

    mostrarConfirm(`Tem certeza que deseja excluir ${listaAlunos.length} aluno(s)?`, async (confirmado) => {
        if (confirmado) {
            const load = document.querySelector('.load');
            if (load) load.style.display = 'flex';

            let sucessos = 0;
            let erros = 0;

            for (const aluno of listaAlunos) {
                try {
                    const response = await fetch('/estudante/deletar', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ra: aluno.ra })
                    });
                    if (response.ok) sucessos++;
                    else erros++;
                } catch (error) {
                    erros++;
                }
            }

            if (load) load.style.display = 'none';
            mostrarAlerta(`Concluído: ${sucessos} apagados, ${erros} falharam.`, sucessos > 0 ? "success" : "erro");
            sairDoModoSelecao();
            listarAlunos();
            await carregarTabelaNotas();
        }
    });
}

async function exportarAlunosSelecionados() {
    const listaAlunos = obterAlunosSelecionados();
    if (listaAlunos.length === 0) {
        mostrarAlerta("Nenhum aluno selecionado.", "aviso");
        return;
    }

    const load = document.querySelector('.load');
    if (load) load.style.display = 'flex';

    try {
        const turmaAtual = obterTurmaAtual();
        if (!turmaAtual) throw new Error("Turma não identificada.");

        const fk_disciplina = turmaAtual.disciplina.codigo;
        const nomeTurma = turmaAtual.nome_turma || "Turma";

        const respComp = await fetch('/componente-nota/all');
        const allComps = await respComp.json();
        const componentesDaTurma = allComps.filter(c => String(c.fk_disciplina_codigo) === String(fk_disciplina));

        const respNotas = await fetch('/nota/all');
        const todasAsNotas = await respNotas.json();

        let csvContent = "RA;Nome";
        componentesDaTurma.forEach(comp => {
            csvContent += `;${comp.sigla || comp.nome}`;
        });
        csvContent += ";Média\n";

        for (const aluno of listaAlunos) {
            let linha = `${aluno.ra};${aluno.nome}`;
            let somaNotas = 0;
            let qtdNotasComputadas = 0;
            
            for (const comp of componentesDaTurma) {
                const notaObj = todasAsNotas.find(n => 
                    String(n.fk_id_estudante) === String(aluno.ra) &&
                    String(n.fk_id_componente) === String(comp.id_componente)
                );

                if (notaObj) {
                    const valorFormatado = String(notaObj.valor_nota).replace('.', ',');
                    linha += `;${valorFormatado}`;
                    somaNotas += Number(notaObj.valor_nota);
                    qtdNotasComputadas++;
                } else {
                    linha += ";-"; 
                }
            }

            let media = 0;
            if (qtdNotasComputadas > 0) {
                media = (somaNotas / qtdNotasComputadas).toFixed(1);
            }
            linha += `;${String(media).replace('.', ',')}`;
            csvContent += linha + "\n";
        }

        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' }); 
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const nomeArquivoSanitizado = nomeTurma.replace(/[\s\/\\]+/g, '_').trim();
        
        link.setAttribute("href", url);
        link.setAttribute("download", `Relatorio_${nomeArquivoSanitizado}.csv`);
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        sairDoModoSelecao();
        mostrarAlerta("Exportação concluída!", "success");

    } catch (error) {
        console.error(error);
        mostrarAlerta("Erro ao exportar: " + error.message, "erro");
    } finally {
        if (load) load.style.display = 'none';
    }
}