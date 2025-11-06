import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { request } from "http";
import cors from "cors";
import path from "path";
import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

console.log("API KEY:", process.env.RESEND_API_KEY);
// import {
//     getAllEstudantes,
//     getEstudanteById,
//     addEstudante,
// } from "./db/estudantes";

import {
    addInstituicao,
    getInstituicaoById,
    getAllInstituicao,
    verificarCadastroInstituicao
} from "./db/instituicao";

import {
    addDocente,
    verificarLoginDocente,
    verificarCadastroDocente,
    modificarSenhaDocente
} from "./db/docente";

import {
    gerarCodigoVericacao,
    enviarCodigoVerificacao,
    enviarLinkAlterarSenha
} from "./services/email";


const app = express();
const port: number = 3000;
let codigoAtivo: string;


app.use(express.static(path.resolve(__dirname, "..")));
app.use("/pages", express.static(path.resolve(__dirname, "../pages")));

app.use(bodyParser.json());
app.use(cors());
app.use('/scripts', express.static(path.join(__dirname, '../scripts')));
app.use('/src', express.static(path.join(__dirname, './src')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// definir a rota default;
app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../index.html"));
});

app.get('/inicio', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/mainPage.html'));
});

app.get('/cadastro', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/pageCadastro.html'));
});

app.get('/recuperar-senha', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/pageEmailToModifyPassword.html'));
});

app.get('/redefinir-senha', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/pageRecoveryPassword.html'));
});

app.get('/verificacao', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/pageVerification.html'));
});

/* INSTITUIÇÃO */
app.post('/instituicao/verificar', async (req: Request, res: Response) => {
    try {
        const { nome } = req.body;
        console.log("🔍 Verificando instituição:", nome);

        const instituicao = await verificarCadastroInstituicao(nome);
        if (instituicao) {
            console.log("❌ Instituição já cadastrada:", instituicao.nome);

            res.json({
                sucesso: false,
                mensagem: "A Instituição já está cadastrada.3",
                nome: instituicao.nome
            });
        } else {
            console.log("✅ Instituição ainda não cadastrada!")
            res.status(401).json({ sucesso: true, mensagem: "Credenciais válidas!" });
        }
    } catch (error) {
        console.error("❌ Erro ao verificar a instituição:", error);
        res.status(500).json({ sucesso: false, mensagem: "Erro no servidor" });
    }
})

app.post('/instituicao/cadastro', async (req: Request, res: Response) => {
    try {
        const { nome } = req.body;
        if (!nome) {
            console.log("❌ Um ou mais campos estão faltando!:");
            return res.status(400).json({error: "Campo Nome é obrigatório!"});
        }

        const id = await addInstituicao(nome);
        console.log("✅ Instituição registrada com sucesso!")
        res.status(201).json({ message: "Instituição registrada com sucesso", id});
    } catch (error) {
        console.error(error);
        console.log("❌ Erro ao registrar a instituição.");
        res.status(500).json({ error: "Erro ao registrar a instituição." })
    }
});

app.post('/instituicao/:id', async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const instituicao = await getInstituicaoById(id);
        if (instituicao) {
            res.json(instituicao);
        } else {
            res.status(404).json({ message: "Instituição não encontrada com o ID fornecido" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao buscar a instituição pelo ID fornecido." });
    }
});

app.post('/instituicao/all', async (req: Request, res: Response) => {
    try {
        const instituicao = await getAllInstituicao();
        if (instituicao) {
            res.json(instituicao);
        } else {
            res.status(404).json({ message: "Não há instituições cadastradas." });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error ao buscar as instituições. "});
    }
})

/* DOCENTE */
app.post('/docente', async (req: Request, res: Response) => {
    try {
        const { nome, email, telefone, senha } = req.body;
        const id = await addDocente(nome, email, telefone, senha);
        res.status(201).json({ sucesso: true, message: "docente adicionado com sucesso", id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ sucesso: false, error: "Erro ao inserir docente." })
    }

});

app.post('/verificar-docente/cadastro', async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        console.log("🔍 Verificando docente:", email);

        const docente = await verificarCadastroDocente(email);

        if (docente) {
            console.log("❌ Docente já cadastrado:", docente.nome);

            // 🟢 RETORNA OS DADOS
            res.json({
                sucesso: false,
                nome: docente.nome,
                email: docente.email
            });
        } else {
            console.log("✅ Docente ainda não cadastrado!")
            res.status(401).json({ sucesso: true, mensagem: "Credenciais inválidas" });
        }
    } catch (error) {
        console.error("❌ Erro ao verificar docente:", error);
        res.status(500).json({ sucesso: false, mensagem: "Erro no servidor" });
    }
});

app.post('/verificar-docente', async (req: Request, res: Response) => {
    try {
        const { email, senha } = req.body;

        console.log("🔍 Verificando docente:", email);

        const docente = await verificarLoginDocente(email, senha);

        if (docente) {
            console.log("✅ Docente encontrado:", docente.nome);
            // 🟢 RETORNA OS DADOS
            res.json({
                sucesso: true,
                nome: docente.nome,
                email: docente.email
            });
        } else {
            console.log("❌ Credenciais inválidas");
            res.status(401).json({ sucesso: false, mensagem: "Credenciais inválidas" });
        }
    } catch (error) {
        console.error("❌ Erro ao verificar docente:", error);
        res.status(500).json({ sucesso: false, mensagem: "Erro no servidor" });
    }
});

app.post('/verificar-codigo', async (req: Request, res: Response) => {
    try {

        const { codigo } = req.body;
        const codigoCerto: string = codigoAtivo;

        console.log(`Verificando o código. Código esperado: ${codigoCerto}, Código recebido: ${codigo}`);

        if (!codigoCerto) {
            return res.status(400).json({ sucesso: false, mensagem: "Código não encontrado ou expirado!" });
        }

        if (codigoCerto === codigo) {
            codigoAtivo = '';
            return res.json({ sucesso: true, mensagem: "Código verificado com sucesso!" });
        } else {
            return res.status(400).json({ sucesso: false, mensagem: "Código incorreto." });
        }
    } catch (error) {
        console.error("Erro ao verificar código:", error);
        return res.status(500).json({ sucesso: false, mensagem: "Erro interno do servidor." });
    }
});

app.post('/enviar-codigo', async (req: Request, res: Response) => {

    console.log("📩 Dados recebidos:", req.body);
    try {
        const { nome, email } = req.body;

        const codigo = gerarCodigoVericacao();

        await enviarCodigoVerificacao(email, nome, codigo);

        codigoAtivo = codigo;

        res.json({
            sucesso: true,
            mensagem: 'Código enviado',
            codigo
        });
    } catch (error) {
        res.status(500).json({ sucesso: false, erro: 'Erro ao enviar o código' });
    }
});

app.post('/link-alterar-senha', async (req: Request, res: Response) => {
    console.log("📩 Solicitação de link para alterar senha recebida.");
    try{
        const { email  } = req.body;
        console.log("Verificando email:", email);
        const encontrado = await verificarCadastroDocente(email);
        if (encontrado === null) {
            console.log("Docente não encontrado para o email:", email);
            res.status(404).json({
                sucesso: false,
                mensagem: 'Docente não encontrado.'
            });
        } else {
            await enviarLinkAlterarSenha(email);
            console.log("Link para alterar senha enviado para:", email);
            res.status(200).json({
                sucesso: true,
                mensagem: "Link enviado!"
            });
        }
    } catch (error) {
        console.error("Erro ao enviar link para alterar senha:", error);
        res.status(500).json({ sucesso: false, error: 'Erro ao enviar o link.'})
    }
});

app.post('/modificar-senha', async (req: Request, res: Response) => {
    console.log("📩 Solicitação para modificar a senha recebida.");
    try{
        const { email ,novaSenha } = req.body;
        await modificarSenhaDocente(email, novaSenha);
        console.log("Senha modificada para o email:", email);
        res.status(200).json({
            sucesso: true,
            mensagem: "Senha modificada com sucesso!"
        });
    } catch (error) {
        console.error("Erro ao modificar a senha:", error);
        res.status(500).json({ sucesso: false, error: "Erro ao modificar a senha."})
    }

});

app.listen(port, '0.0.0.0', () => console.log("🚀 Servidor rodando em http://notadez.cfd"));

// rota de ping/pong (teste de requisicao)
app.post("/printRequest", (req: Request, res: Response) => {
    const dadosRecebidos = req.body;
    res.json({
        mensagem: "Dados recebidos com sucesso!",
        dadosRecebidos
    });
});

