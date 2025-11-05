import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export function gerarCodigoVericacao(): string {
  const codigo: string = Math.floor(100000 + Math.random() * 900000).toString();
  return codigo;
}

export async function enviarCodigoVerificacao(email: string, nome: string, codigo: string): Promise<void> {
  try {
    const data = await resend.emails.send({
      from: "NotaDez <codigo@notadez.cfd>",
      to: email,
      subject: "Seu código de verificação - NotaDez",
      html: `<p>Olá, <strong>${nome}</strong>!</p>
             <p>Seu código de verificação é: <strong>${codigo}</strong></p>`,
    });

    console.log("✅ Email enviado com sucesso:", data);
  } catch (error: any) {
    console.error("❌ Erro ao enviar email:", error);
    throw new Error(`Erro ao enviar email: ${error.message}`);
  }
}

export async function enviarLinkAlterarSenha(email: string): Promise<void>{
  try{
    const data = await resend.emails.send({
      from: "NotaDez <alterarsenha@notadez.cfd>",
      to: email,
      subject: "Link para alteração de senha - NotaDez",
      html: `
             <p>Clique <a href="../pages/pageRecoveryPassword.html">aqui</a> para alterar sua senha!</p>      `
    });
  } catch (error:any) {
    console.error("❌ Erro ao enviar email:", error);
    throw new Error(`Erro ao enviar email: ${error.message}`);
  }
}