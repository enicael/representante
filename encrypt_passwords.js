const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
    user: 'root', // substitua pelo seu usuário do PostgreSQL
    host: '144.22.220.181',
    database: 'representacoes',
    password: 'M@ster2019', // substitua pela sua senha do PostgreSQL
    port: 5432,
});

async function encryptPasswords() {
    try {
        const result = await pool.query('SELECT codigo_representante, senha FROM representante');
        for (let row of result.rows) {
            const hashedPassword = await bcrypt.hash(row.senha, 10);
            await pool.query('UPDATE representante SET senha = $1 WHERE codigo_representante = $2', [hashedPassword, row.codigo_representante]);
            console.log(`Senha para representante ${row.codigo_representante} atualizada.`);
        }
        console.log('Todas as senhas foram criptografadas.');
    } catch (err) {
        console.error('Erro ao criptografar senhas:', err);
    } finally {
        pool.end();
    }
}

encryptPasswords();
