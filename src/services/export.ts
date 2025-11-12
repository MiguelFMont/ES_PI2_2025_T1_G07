import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { getConnection } from './database'; 

const router = Router();
  
// Estrutura de dados para o arquivo de exportação (notas)
interface NotaExport {
    matricula: string;
    nome: string;
    nota: string;
}

// ROTA: EXPORTAÇÃO DE NOTAS (CSV ou JSON)
router.get("/exportar-notas", async (req: Request, res: Response) => {
    // Determina o formato de saída (JSON ou CSV - padrão) a partir da query string
    const formato = (req.query.formato as string)?.toLowerCase() === 'json' ? 'json' : 'csv';
    let conexao: any; 
    let caminho: string | undefined;

    try {
        conexao = await getConnection();

        // Consulta SQL para obter matrícula, nome e nota (usando NVL para notas ausentes)
        const resultado = await conexao.execute<any[]>(`
            SELECT a.matricula, a.nome, NVL(n.nota, '-') AS nota
            FROM alunos a
            LEFT JOIN notas n ON a.matricula = n.matricula
        `);

        // Fecha a conexão assim que os dados são lidos
        await conexao.close();
        conexao = undefined; 

        // Mapeia o resultado do DB (array de tuplas) para um array de objetos NotaExport
        const notas: NotaExport[] = resultado.rows.map(row => ({
            matricula: row[0].toString(),
            nome: row[1].toString(),
            nota: row[2].toString(),
        }));


        // Cria o caminho e nome do arquivo com timestamp
        const agora = new Date();
        const nomeArquivo = `${agora.toISOString().replace(/[:.]/g, "-")}_TurmaX_Notas.${formato}`;
        caminho = path.join("exports", nomeArquivo);

        // Gera e salva o conteúdo do arquivo (JSON ou CSV)
        if (formato === "json") {
            fs.writeFileSync(caminho, JSON.stringify(notas, null, 2), "utf8");
        } else {
            const csv = Papa.unparse(notas); // Converte array de objetos para string CSV
            fs.writeFileSync(caminho, csv, "utf8");
        }

        res.download(caminho, (err) => {
            if (err) {
                console.error("Erro ao fazer download do arquivo:", err);
            }
            try {
                if (caminho && fs.existsSync(caminho)) fs.unlinkSync(caminho);
            } catch (unlinkErr) {
                console.error("Erro ao deletar arquivo temporário:", unlinkErr);
            }
        });

    } catch (err) {
        console.error("Erro durante a exportação:", err);
        res.status(500).json({ erro: "Erro interno no servidor ao processar a exportação." });
    } finally {
        if (conexao) {
            try {
                await conexao.close();
            } catch (closeErr) {
                console.error("Erro ao fechar a conexão no finally:", closeErr);
            }
        }
    }
});

export default router;