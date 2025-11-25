// AUTOR: Davi José Bertuolo Vitoreti - RA: 25004168

import { open, close } from "../config/db";
import OracleDB from "oracledb";

export interface Curso {
    id: number;
    nome: string;
}

// Adicionar um curso
export async function addCurso(
    fk_id_instituicao: number,
    nome: string
): Promise<number> {
    const conn = await open();
    try {
        const result = await conn.execute<{ outBinds: { id: number[] } }>(
            `INSERT INTO Curso (Nome)
             VALUES (:nome)
             RETURNING ID_Curso INTO :id`,
            {
                nome,
                id: { dir: OracleDB.BIND_OUT, type: OracleDB.NUMBER }
            },
            { autoCommit: false }
        );

        const outBinds = result.outBinds as { id?: number[] } | undefined;

        if (!outBinds?.id?.[0]) {
            throw new Error("Erro ao obter o ID retornado na inserção do Curso.");
        }

        const id_curso = outBinds.id[0];

        await conn.execute(
            `INSERT INTO INSTITUICAO_CURSO (FK_ID_INSTITUICAO, FK_ID_CURSO)
             VALUES (:id_instituicao, :id_curso)`,
            { id_instituicao: fk_id_instituicao, id_curso },
            { autoCommit: false }
        );

        await conn.commit();

        return id_curso;
    } finally {
        await close(conn);
    }
}

// Deletar um curso
export async function deleteCurso(id: number, id_instituicao: number): Promise<boolean> {
    const conn = await open();
    try {
        // 1️⃣ Apaga os vínculos da tabela relacionamento
        await conn.execute(
            `DELETE FROM INSTITUICAO_CURSO WHERE FK_ID_CURSO = :id AND FK_ID_INSTITUICAO = :id_instituicao`,
            { id, id_instituicao },
            { autoCommit: false }
        );

        // 2️⃣ Apaga o curso
        const result = await conn.execute(
            `DELETE FROM Curso WHERE ID_Curso = :id`,
            { id },
            { autoCommit: false }
        );

        // 3️⃣ Commit
        await conn.commit();

        return result.rowsAffected !== undefined && result.rowsAffected > 0;
    } finally {
        await close(conn);
    }
}

// Atualizar um curso
export async function updateCurso(
    id: number,
    nome: string
) {
    const conn = await open();
    try {
        await conn.execute(
            `UPDATE Curso 
             SET Nome = :nome
             WHERE ID_Curso = :id`,
            { nome, id },
            { autoCommit: true }
        );
    } finally {
        await close(conn);
    }
}

// Verificar se curso já existe
export async function verificarCadastroCurso(nome: string, id_instituicao: number): Promise<Curso | null> {
    const conn = await open();
    try {
        const result = await conn.execute(
            `SELECT C.ID_CURSO as "id", C.NOME as "nome"
             FROM CURSO C
             INNER JOIN INSTITUICAO_CURSO IC ON C.ID_CURSO = IC.FK_ID_CURSO
             WHERE UPPER(C.NOME) = UPPER(:nome)
               AND IC.FK_ID_INSTITUICAO = :id_instituicao
             FETCH FIRST 1 ROWS ONLY`,
            { nome, id_instituicao },
            { outFormat: OracleDB.OUT_FORMAT_OBJECT }
        );
        if (result.rows && result.rows.length > 0) {
            return result.rows[0] as Curso;
        }
        return null;
    } finally {
        await close(conn);
    }
}

// Obter curso pelo ID
export async function getCursoById(id: number): Promise<Curso | null> {
    const conn = await open();
    try {
        const result = await conn.execute(
            `SELECT ID_Curso as "id",
                    FK_ID_Docente as "fk_id_docente",
                    FK_ID_Instituicao as "fk_id_instituicao",
                    Nome as "nome"
             FROM Curso
             WHERE ID_Curso = :id`,
            { id },
            { outFormat: OracleDB.OUT_FORMAT_OBJECT }
        );

        return (result.rows?.[0] as Curso) || null;
    } finally {
        await close(conn);
    }
}

// Obter todos os cursos
export async function getAllCurso(id_instituicao: number): Promise<Curso[]> {
    const conn = await open();
    try {
        const result = await conn.execute(
            `SELECT C.ID_CURSO as "id", C.NOME as "nome"
             FROM INSTITUICAO_CURSO IC
             INNER JOIN CURSO C ON IC.FK_ID_CURSO = C.ID_CURSO
             WHERE IC.FK_ID_INSTITUICAO = :id_instituicao`,
            { id_instituicao },
            { outFormat: OracleDB.OUT_FORMAT_OBJECT }
        );
        
        console.log(`📚 ${result.rows?.length || 0} curso(s) encontrado(s) para instituição ${id_instituicao}`);
        
        return result.rows ? result.rows as Curso[] : [];
    } catch (error) {
        console.error("❌ Erro ao buscar cursos da instituição:", error);
        throw error;
    } finally {
        await close(conn);
    }
}
