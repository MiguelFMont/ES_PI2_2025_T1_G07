import {open, close} from "../config/db";
import OracleDB from "oracledb";

export interface Instituicao {
    id: number,
    nome: string
};

// ✅ VERIFICA SE O DOCENTE JÁ TEM UMA INSTITUIÇÃO COM ESTE NOME
export async function verificarCadastroInstituicao(nome: string, id_docente: number): Promise<Instituicao | null> {
    const conn = await open();
    try {
        const result = await conn.execute<Instituicao>(
            `SELECT I.ID_INSTITUICAO as "id", I.NOME as "nome" 
            FROM INSTITUICAO I
            INNER JOIN DOCENTE_INSTITUICAO DI ON I.ID_INSTITUICAO = DI.FK_ID_INSTITUICAO
            WHERE UPPER(I.NOME) = UPPER(:nome)
            AND DI.FK_ID_DOCENTE = :id_docente
            FETCH FIRST 1 ROWS ONLY`,
            { nome, id_docente },
            { outFormat: OracleDB.OUT_FORMAT_OBJECT }
        );
        
        if (result.rows && result.rows.length > 0) {
            return result.rows[0];
        }
        
        return null;
    } catch (error) {
        console.error("❌ Erro ao verificar instituição:", error);
        throw error;
    } finally {
        await close(conn);
    }
}

// ✅ ADICIONAR INSTITUIÇÃO (sempre cria e vincula)
export async function addInstituicao(nome: string, id_docente: number): Promise<{id: number; nome: string}> {
    const conn = await open();
    try {
        // 1️⃣ INSERE NA TABELA INSTITUICAO
        const result = await conn.execute<{outBinds : {id: number}}>(
            `INSERT INTO INSTITUICAO (NOME)
            VALUES (:nome)
            RETURNING ID_INSTITUICAO INTO :id`,
            {
                nome, 
                id: {dir: OracleDB.BIND_OUT, type: OracleDB.NUMBER}
            },
            {autoCommit: false}
        );

        const outBinds = result.outBinds as {id?: number[]} | undefined;

        if (!outBinds || !outBinds.id || outBinds.id.length === 0) {
            throw new Error("Erro ao obter um ID retornado na inserção da Instituição.");
        }

        const id_instituicao = outBinds.id[0];

        // 2️⃣ INSERE NA TABELA DOCENTE_INSTITUICAO (vincula docente à instituição)
        await conn.execute(
            `INSERT INTO DOCENTE_INSTITUICAO (FK_ID_DOCENTE, FK_ID_INSTITUICAO)
            VALUES (:id_docente, :id_instituicao)`,
            { id_docente, id_instituicao },
            { autoCommit: false }
        );

        // 3️⃣ COMMIT
        await conn.commit();

        console.log(`✅ Instituição ${id_instituicao} criada e vinculada ao docente ${id_docente}`);
        
        return {
            id: id_instituicao,
            nome: nome
        };
    } catch (error) {
        await conn.rollback();
        console.error("❌ Erro ao adicionar instituição:", error);
        throw error;
    } finally {
        await close(conn);
    }
}

// ✅ DELETAR INSTITUIÇÃO (remove da INSTITUICAO e DOCENTE_INSTITUICAO)
export async function deleteInstituicao(id: number): Promise<boolean> {
    const conn = await open();
    try {
        // 1️⃣ DELETA DA TABELA DOCENTE_INSTITUICAO (remove o vínculo)
        await conn.execute(
            `DELETE FROM DOCENTE_INSTITUICAO WHERE FK_ID_INSTITUICAO = :id`,
            { id },
            { autoCommit: false }
        );
        console.log(`🗑️ Vínculo removido de DOCENTE_INSTITUICAO para instituição ${id}`);

        // 2️⃣ DELETA DA TABELA INSTITUICAO (remove a instituição)
        const result = await conn.execute(
            `DELETE FROM INSTITUICAO WHERE ID_INSTITUICAO = :id`,
            { id },
            { autoCommit: false }
        );
        
        // 3️⃣ COMMIT
        await conn.commit();
        
        console.log(`🗑️ Instituição ${id} deletada de INSTITUICAO`);
        return result.rowsAffected !== undefined && result.rowsAffected > 0;
    } catch (error) {
        await conn.rollback();
        console.error("❌ Erro ao deletar instituição:", error);
        throw error;
    } finally {
        await close(conn);
    }
}

// ✅ ATUALIZAR INSTITUIÇÃO
export async function updateInstituicao(id: number, novo_nome: string): Promise<boolean> {
    const conn = await open();
    try {
        const result = await conn.execute(
            `UPDATE INSTITUICAO
            SET NOME = :novo_nome
            WHERE ID_INSTITUICAO = :id`,
            { novo_nome, id },
            { autoCommit: true }
        );
        
        console.log(`✏️ Instituição ${id} atualizada para "${novo_nome}"`);
        return result.rowsAffected !== undefined && result.rowsAffected > 0;
    } catch (error) {
        console.error("❌ Erro ao atualizar instituição:", error);
        throw error;
    } finally {
        await close(conn);
    }
}

// ✅ Obter a instituição pelo ID
export async function getInstituicaoById(id: number): Promise<Instituicao | null> {
    const conn = await open();
    try {
        const result = await conn.execute(
            `SELECT ID_INSTITUICAO as "id", NOME as "nome" FROM INSTITUICAO
            WHERE ID_INSTITUICAO = :id`,
            { id },
            { outFormat: OracleDB.OUT_FORMAT_OBJECT }
        );
        
        if (result.rows && result.rows.length > 0) {
            return result.rows[0] as Instituicao;
        }
        
        return null;
    } catch (error) {
        console.error("❌ Erro ao obter instituição por ID:", error);
        throw error;
    } finally {
        await close(conn);
    }
}

// ✅ Buscar todas as instituições do docente
export async function getAllInstituicao(id_docente: number): Promise<Instituicao[]> {
    const conn = await open();
    try {
        const result = await conn.execute(
            `SELECT I.ID_INSTITUICAO as "id", I.NOME as "nome"
            FROM DOCENTE_INSTITUICAO DI
            INNER JOIN INSTITUICAO I ON DI.FK_ID_INSTITUICAO = I.ID_INSTITUICAO
            WHERE DI.FK_ID_DOCENTE = :id_docente`,
            { id_docente },
            { outFormat: OracleDB.OUT_FORMAT_OBJECT }
        );
        
        console.log(`📚 ${result.rows?.length || 0} instituição(ões) encontrada(s) para docente ${id_docente}`);
        
        return result.rows ? result.rows as Instituicao[] : [];
    } catch (error) {
        console.error("❌ Erro ao buscar instituições do docente:", error);
        throw error;
    } finally {
        await close(conn);
    }
}