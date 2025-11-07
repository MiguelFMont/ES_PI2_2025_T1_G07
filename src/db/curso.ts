import { open, close } from "../config/db";
import OracleDB from "oracledb";

export interface Curso {
    id: number;
    fk_id_docente: number;
    fk_id_instituicao: number;
    nome: string;
}

// Adicionar um curso
export async function addCurso(
    fk_id_docente: number,
    fk_id_instituicao: number,
    nome: string
): Promise<number> {
    const conn = await open();
    try {
        const result = await conn.execute<{ outBinds: { id: number } }>(
            `INSERT INTO Curso (FK_ID_Docente, FK_ID_Instituicao, Nome)
             VALUES (:fk_id_docente, :fk_id_instituicao, :nome)
             RETURNING ID_Curso INTO :id`,
            {
                fk_id_docente,
                fk_id_instituicao,
                nome,
                id: { dir: OracleDB.BIND_OUT, type: OracleDB.NUMBER }
            },
            { autoCommit: true }
        );

        const outBinds = result.outBinds as { id?: number[] } | undefined;

        if (!outBinds?.id?.[0]) {
            throw new Error("Erro ao obter o ID retornado na inserção do Curso.");
        }

        return outBinds.id[0];
    } finally {
        await close(conn);
    }
}

// Deletar um curso
export async function deleteCurso(id: number) {
    const conn = await open();
    try {
        await conn.execute(
            `DELETE FROM Curso WHERE ID_Curso = :id`,
            { id },
            { autoCommit: true }
        );
    } finally {
        await close(conn);
    }
}

// Atualizar um curso
export async function updateCurso(
    id: number,
    fk_id_docente: number,
    fk_id_instituicao: number,
    nome: string
) {
    const conn = await open();
    try {
        await conn.execute(
            `UPDATE Curso 
             SET FK_ID_Docente = :fk_id_docente,
                 FK_ID_Instituicao = :fk_id_instituicao,
                 Nome = :nome
             WHERE ID_Curso = :id`,
            { fk_id_docente, fk_id_instituicao, nome, id },
            { autoCommit: true }
        );
    } finally {
        await close(conn);
    }
}

// Verificar se curso já existe
export async function verificarCursoExistente(
    fk_id_docente: number,
    fk_id_instituicao: number,
    nome: string
): Promise<Curso | null> {
    const conn = await open();
    try {
        const result = await conn.execute(
            `SELECT ID_Curso as "id",
                    FK_ID_Docente as "fk_id_docente",
                    FK_ID_Instituicao as "fk_id_instituicao",
                    Nome as "nome"
             FROM Curso  
             WHERE FK_ID_Docente = :fk_id_docente
               AND FK_ID_Instituicao = :fk_id_instituicao
               AND Nome = :nome
             FETCH FIRST 1 ROWS ONLY`,
            { fk_id_docente, fk_id_instituicao, nome },
            { outFormat: OracleDB.OUT_FORMAT_OBJECT }
        );

        return (result.rows?.[0] as Curso) || null;
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
export async function getAllCursos(): Promise<Curso[]> {
    const conn = await open();
    try {
        const result = await conn.execute(
            `SELECT ID_Curso as "id",
                    FK_ID_Docente as "fk_id_docente",
                    FK_ID_Instituicao as "fk_id_instituicao",
                    Nome as "nome"
             FROM Curso`
        );

        return result.rows as Curso[];
    } finally {
        await close(conn);
    }
}