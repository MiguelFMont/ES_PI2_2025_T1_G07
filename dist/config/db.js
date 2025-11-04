"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.open = open;
exports.close = close;
const oracledb_1 = __importDefault(require("oracledb"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// caminho da wallet de conexao com o oracle.
const walletPath = `${process.env.WALLET_PATH}`;
console.log(walletPath);
// inicializando o cliente oracle, usando a wallet.
oracledb_1.default.initOracleClient({ configDir: walletPath });
// formato de saída dos dados, vai ser objetos JavaScript estruturados.
oracledb_1.default.outFormat = oracledb_1.default.OUT_FORMAT_OBJECT;
const dbConfig = {
    user: "WEBAPP",
    password: "superSecretMyPassword123",
    connectString: "notadez_high"
};
// função para abrir conexões com o oracle
async function open() {
    try {
        const connection = await oracledb_1.default.getConnection(dbConfig);
        console.log("conexão OCI - aberta");
        return connection;
    }
    catch (err) {
        console.error("Erro ao abrir conexão com o Oracle: ", err);
        throw err;
    }
}
// função para fechar conexão
async function close(connection) {
    try {
        await connection.close();
        console.log("Conexão OCI - fechada");
    }
    catch (err) {
        console.error("Erro ao fechar conexão com o Oracle: ", err);
    }
}
