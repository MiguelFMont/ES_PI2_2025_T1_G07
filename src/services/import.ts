// import { Router, Request, Response } from 'express';
// import multer from 'multer';
// import fs from 'fs';
// import Papa from 'papaparse';
// import { getConnection } from './database'; 

// // Configuração do Multer: armazena arquivos temporariamente no diretório "uploads/"
// const upload = multer({ dest: "uploads/" });
// const router = Router();


// // Estrutura esperada para cada aluno no arquivo de importação
// interface Aluno {
//     Matricula: string;
//     Nome: string;
//     [key: string]: any; 
// }

// // Extensão da Request do Express para incluir o arquivo do Multer
// interface MulterRequest extends Request {
//     file: Express.Multer.File;
// }

// // ROTA: IMPORTAÇÃO DE ALUNOS (JSON ou CSV)
// router.post("/importar-alunos", upload.single("arquivo"), async (req: Request, res: Response) => {
//     // Afirmação de tipo para garantir que req.file está presente e tipado
//     const file = (req as MulterRequest).file;
//     if (!file) {
//         return res.status(400).json({ erro: "Nenhum arquivo enviado." });
//     }
    
//     const { mimetype, path: filePath } = file;
//     let conexao: any; 
//     let alunos: Aluno[] = [];

//     try {
//         // Conexão ao DB
//         conexao = await getConnection();

//         if (mimetype === "application/json") {
//             const fileContent = fs.readFileSync(filePath, "utf8");
//             alunos = JSON.parse(fileContent) as Aluno[];

//         } else if (mimetype === "text/csv" || mimetype === "application/vnd.ms-excel") {
//             const fileContent = fs.readFileSync(filePath, "utf8");
//             const resultado = Papa.parse(fileContent, { header: true });
//             alunos = resultado.data.filter((aluno: any) => aluno && aluno.Matricula && aluno.Nome) as Aluno[];
//         } else {
//             return res.status(400).json({ erro: "Formato de arquivo não suportado. Use JSON ou CSV." });
//         }

//         // Insere cada aluno no banco de dados Oracle
//         for (const aluno of alunos) {
//             await conexao.execute(
//                 `INSERT INTO alunos (matricula, nome) VALUES (:matricula, :nome)`,
//                 { matricula: aluno.Matricula, nome: aluno.Nome }
//             );
//         }

//         await conexao.commit();
//         res.json({ mensagem: "Alunos importados com sucesso!", total: alunos.length });

//     } catch (err) {
//         console.error("Erro durante a importação:", err);
//         if (conexao) {
//             try {
//                 await conexao.rollback();
//             } catch (rbErr) {
//                 console.error("Erro ao tentar rollback:", rbErr);
//             }
//         }
//         res.status(500).json({ erro: "Erro interno no servidor ao processar a importação." });
//     } finally {
//         // Limpa o arquivo temporário e fecha a conexão
//         if (filePath && fs.existsSync(filePath)) {
//             fs.unlinkSync(filePath);
//         }
//         if (conexao) {
//             await conexao.close();
//         }
//     }
// });

// export default router;