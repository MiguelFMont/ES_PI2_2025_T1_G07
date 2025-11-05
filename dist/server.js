"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
console.log("API KEY:", process.env.RESEND_API_KEY);
// import {
//     getAllEstudantes,
//     getEstudanteById,
//     addEstudante,
// } from "./db/estudantes";
const docente_1 = require("./db/docente");
const email_1 = require("./services/email");
const app = (0, express_1.default)();
const port = 3000;
let codigoAtivo;
app.use(express_1.default.static(path_1.default.resolve(__dirname, "..")));
app.use("/pages", express_1.default.static(path_1.default.resolve(__dirname, "../pages")));
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)());
app.use('/scripts', express_1.default.static(path_1.default.join(__dirname, '../scripts')));
app.use('/src', express_1.default.static(path_1.default.join(__dirname, './src')));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// definir a rota default;
app.get("/", (req, res) => {
    res.sendFile(path_1.default.resolve(__dirname, "../index.html"));
});
app.get('/inicio', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../pages/mainPage.html'));
});
app.get('/cadastro', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../pages/pageCadastro.html'));
});
app.get('/recuperar-senha', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../pages/pageEmailToModifyPassword.html'));
});
app.get('/redefinir-senha', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../pages/pageRecoveryPassword.html'));
});
app.get('/verificacao', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../pages/pageVerification.html'));
});
app.post('/docente', async (req, res) => {
    try {
        const { nome, email, telefone, senha } = req.body;
        const id = await (0, docente_1.addDocente)(nome, email, telefone, senha);
        res.status(201).json({ sucesso: true, message: "docente adicionado com sucesso", id });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ sucesso: false, error: "Erro ao inserir docente." });
    }
});
app.post('/verificar-docente/cadastro', async (req, res) => {
    try {
        const { email } = req.body;
        console.log("🔍 Verificando docente:", email);
        const docente = await (0, docente_1.verificarCadastroDocente)(email);
        if (docente) {
            console.log("❌ Docente já cadastrado:", docente.nome);
            // 🟢 RETORNA OS DADOS
            res.json({
                sucesso: false,
                nome: docente.nome,
                email: docente.email
            });
        }
        else {
            console.log("✅ Docente ainda não cadastrado!");
            res.status(401).json({ sucesso: true, mensagem: "Credenciais inválidas" });
        }
    }
    catch (error) {
        console.error("❌ Erro ao verificar docente:", error);
        res.status(500).json({ sucesso: false, mensagem: "Erro no servidor" });
    }
});
app.post('/verificar-docente', async (req, res) => {
    try {
        const { email, senha } = req.body;
        console.log("🔍 Verificando docente:", email);
        const docente = await (0, docente_1.verificarLoginDocente)(email, senha);
        if (docente) {
            console.log("✅ Docente encontrado:", docente.nome);
            // 🟢 RETORNA OS DADOS
            res.json({
                sucesso: true,
                nome: docente.nome,
                email: docente.email
            });
        }
        else {
            console.log("❌ Credenciais inválidas");
            res.status(401).json({ sucesso: false, mensagem: "Credenciais inválidas" });
        }
    }
    catch (error) {
        console.error("❌ Erro ao verificar docente:", error);
        res.status(500).json({ sucesso: false, mensagem: "Erro no servidor" });
    }
});
app.post('/verificar-codigo', async (req, res) => {
    try {
        const { codigo } = req.body;
        const codigoCerto = codigoAtivo;
        console.log(`Verificando o código. Código esperado: ${codigoCerto}, Código recebido: ${codigo}`);
        if (!codigoCerto) {
            return res.status(400).json({ sucesso: false, mensagem: "Código não encontrado ou expirado!" });
        }
        if (codigoCerto === codigo) {
            codigoAtivo = '';
            return res.json({ sucesso: true, mensagem: "Código verificado com sucesso!" });
        }
        else {
            return res.status(400).json({ sucesso: false, mensagem: "Código incorreto." });
        }
    }
    catch (error) {
        console.error("Erro ao verificar código:", error);
        return res.status(500).json({ sucesso: false, mensagem: "Erro interno do servidor." });
    }
});
app.post('/enviar-codigo', async (req, res) => {
    console.log("📩 Dados recebidos:", req.body);
    try {
        const { nome, email } = req.body;
        const codigo = (0, email_1.gerarCodigoVericacao)();
        await (0, email_1.enviarCodigoVerificacao)(email, nome, codigo);
        codigoAtivo = codigo;
        res.json({
            mensagem: 'Código enviado',
            codigo
        });
    }
    catch (error) {
        res.status(500).json({ erro: 'Erro ao enviar o código' });
    }
});
app.post('/link-alterar-senha', async (req, res) => {
    console.log("📩 Solicitação de link para alterar senha recebida.");
    try {
        const { email } = req.body;
        console.log("Verificando email:", email);
        const encontrado = await (0, docente_1.verificarCadastroDocente)(email);
        if (encontrado === null) {
            console.log("Docente não encontrado para o email:", email);
            res.status(404).json({
                sucesso: false,
                mensagem: 'Docente não encontrado.'
            });
        }
        else {
            await (0, email_1.enviarLinkAlterarSenha)(email);
            console.log("Link para alterar senha enviado para:", email);
            res.status(200).json({
                sucesso: true,
                mensagem: "Link enviado!"
            });
        }
    }
    catch (error) {
        console.error("Erro ao enviar link para alterar senha:", error);
        res.status(500).json({ sucesso: false, error: 'Erro ao enviar o link.' });
    }
});
app.post('/modificar-senha', async (req, res) => {
    console.log("📩 Solicitação para modificar a senha recebida.");
    try {
        const { email, novaSenha } = req.body;
        await (0, docente_1.modificarSenhaDocente)(email, novaSenha);
        res.json({
            sucesso: true,
            mensagem: "Senha modificada com sucesso!"
        });
    }
    catch (error) {
        console.error("Erro ao modificar a senha:", error);
        res.status(500).json({ sucesso: false, error: "Erro ao modificar a senha." });
    }
});
app.listen(port, '0.0.0.0', () => console.log("🚀 Servidor rodando em http://localhost:3000"));
// rota de ping/pong (teste de requisicao)
app.post("/printRequest", (req, res) => {
    const dadosRecebidos = req.body;
    res.json({
        mensagem: "Dados recebidos com sucesso!",
        dadosRecebidos
    });
});
