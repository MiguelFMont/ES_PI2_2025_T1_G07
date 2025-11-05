"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gerarCodigoVericacao = gerarCodigoVericacao;
exports.enviarCodigoVerificacao = enviarCodigoVerificacao;
exports.enviarLinkAlterarSenha = enviarLinkAlterarSenha;
const resend_1 = require("resend");
const resend = new resend_1.Resend(process.env.RESEND_API_KEY);
function gerarCodigoVericacao() {
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    return codigo;
}
async function enviarCodigoVerificacao(email, nome, codigo) {
    try {
        const data = await resend.emails.send({
            from: "NotaDez <codigo@notadez.cfd>",
            to: email,
            subject: "Seu código de verificação - NotaDez",
            html: `<p>Olá, <strong>${nome}</strong>!</p>
             <p>Seu código de verificação é: <strong>${codigo}</strong></p>`,
        });
        console.log("✅ Email enviado com sucesso:", data);
    }
    catch (error) {
        console.error("❌ Erro ao enviar email:", error);
        throw new Error(`Erro ao enviar email: ${error.message}`);
    }
}
async function enviarLinkAlterarSenha(email) {
    try {
        const data = await resend.emails.send({
            from: "NotaDez <alterarsenha@notadez.cfd>",
            to: email,
            subject: "Link para alteração de senha - NotaDez",
            html: `
             <p>Clique <a href="../pages/pageRecoveryPassword.html">aqui</a> para alterar sua senha!</p>      `
        });
    }
    catch (error) {
        console.error("❌ Erro ao enviar email:", error);
        throw new Error(`Erro ao enviar email: ${error.message}`);
    }
}
