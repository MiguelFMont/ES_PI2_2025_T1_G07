import {open, close} from "../config/db";
import OracleDB from "oracledb";

export interface Disciplina {
    codigo: number,
    id_curso: number,
    nome: string,
    periodo: string,
    sigla: string
};

// Adicionar uma disciplina a tabela DISCIPLINA no Oracle
export async function addDisciplina(
    codigo: number, // NOVO PARÂMETRO
    id_curso: number,
    nome: string,
    periodo: string,
    sigla: string
): Promise<number> {
    const conn = await open();
    try {
        const result = await conn.execute(
            `
            INSERT INTO DISCIPLINA (CODIGO, FK_ID_CURSO, NOME, PERIODO, SIGLA)
            VALUES (:codigo, :id_curso, :nome, :periodo, :sigla)
            `,
            { codigo, id_curso, nome, periodo, sigla }, // INCLUÍDO codigo
            { autoCommit: true }
        );

        return codigo; // RETORNA O CÓDIGO INSERIDO
        
    } finally {
        await close(conn);
    }
}

// Deletar uma disciplinas a partir de seu codigo
export async function deleteDisciplina(codigo: number) {
    const conn = await open();
    try {
        await conn.execute(
            `DELETE FROM DISCIPLINA WHERE CODIGO = :codigo`,
            { codigo },
            { autoCommit: true }
        );
    } finally {
        await close(conn);
    }
}

// Atualiza os dados de uma disciplina a partir de seu codigo
export async function updateDisciplina(
    codigo: number,
    id_curso: number,
    nome: string,
    periodo: string,
    sigla: string
) {
    const conn = await open();
    try {
        await conn.execute(
            `UPDATE DISCIPLINA 
             SET FK_ID_CURSO = :id_curso,
                 NOME = :nome,
                 PERIODO = :periodo,
                 SIGLA = :sigla
             WHERE CODIGO = :codigo`,
            { codigo, id_curso, nome, periodo, sigla },
            { autoCommit: true }
        );
    } finally {
        await close(conn);
    }
}

// Verificar se disciplina já está cadastrada no mesmo curso
export async function verificarCadastroDisciplina(
    nome: string, 
    id_curso: number
): Promise<Disciplina | null> {
    const conn = await open();
    try {
        const result = await conn.execute(
            `SELECT CODIGO as "codigo", FK_ID_CURSO as "id_curso", NOME as "nome", PERIODO as "periodo", SIGLA as "sigla" 
             FROM DISCIPLINA 
             WHERE NOME = :nome AND FK_ID_CURSO = :id_curso`,
            { nome, id_curso }
        );
        
        if (result.rows && result.rows.length > 0) {
            const row = result.rows[0] as any;
            return {
                codigo: row[0],
                id_curso: row[1],
                nome: row[2],
                periodo: row[3],
                sigla: row[4]
            };
        }
        return null;
    } finally {
        await close(conn);
    }
}

// Obter todos as disciplinas da tabela DISCIPLINA do Oracle
export async function getAllDisciplina(): Promise<Disciplina[]> {
    const conn = await open();
    try {
        const result = await conn.execute(
            `SELECT CODIGO as "codigo", FK_ID_CURSO as "id_curso", NOME as "nome", PERIODO as "periodo", SIGLA as "sigla" FROM DISCIPLINA`
        );
        
        return result.rows as Disciplina[];
    } finally {
        await close(conn);
    }
}

// Obter a disciplina pelo CODIGO - CORRIGIDO
export async function getDisciplinaByCodigo(codigo: number): Promise<Disciplina | null> {
    const conn = await open();
    try {
        const result = await conn.execute(
            `SELECT CODIGO as "codigo", FK_ID_CURSO as "id_curso", NOME as "nome", PERIODO as "periodo", SIGLA as "sigla" 
             FROM DISCIPLINA 
             WHERE CODIGO = :codigo`,
            { codigo }
        );
        
        if (result.rows && result.rows.length > 0) {
            const row = result.rows[0] as any;
            return {
                codigo: row.codigo,
                id_curso: row.id_curso,
                nome: row.nome,
                periodo: row.periodo,
                sigla: row.sigla
            };
        }
        return null;
    } finally {
        await close(conn);
    }
}