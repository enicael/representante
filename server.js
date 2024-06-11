const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const session = require('express-session');

const app = express();
const PORT = 3000;

const pool = new Pool({
    user: 'root', // substitua pelo seu usuário do PostgreSQL
    host: '144.22.220.181',
    database: 'representacoes',
    password: 'M@ster2019', // substitua pela sua senha do PostgreSQL
    port: 5432,
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.use(session({
    secret: 'secreta',
    resave: false,
    saveUninitialized: false,
}));

// Middleware para verificar se o usuário está autenticado
function checkAuth(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.status(401).send('Usuário não autenticado');
    }
}

app.post('/api/register', async (req, res) => {
    const { email, senha, nome } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(senha, 10);
        const result = await pool.query(
            'INSERT INTO representante (email, senha, representante) VALUES ($1, $2, $3) RETURNING *',
            [email, hashedPassword, nome]
        );
        console.log('Usuário registrado:', result.rows[0]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao registrar usuário:', err);
        res.status(500).send('Erro ao registrar usuário');
    }
});

app.post('/api/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        const result = await pool.query('SELECT * FROM representante WHERE email = $1', [email]);

        if (result.rows.length > 0) {
            const user = result.rows[0];
            console.log('Usuário encontrado:', user);

            const match = await bcrypt.compare(senha, user.senha);
            console.log('Senha corresponde:', match);

            if (match) {
                req.session.user = user;
                await pool.query('UPDATE representante SET ultimo_logon = NOW() WHERE email = $1', [email]);

                console.log('Redirecionando para /index.html');
                res.json({ message: 'Login bem-sucedido', redirectUrl: '/index.html' });
            } else {
                res.status(401).json({ message: 'Senha incorreta' });
            }
        } else {
            res.status(404).json({ message: 'Usuário não encontrado' });
        }
    } catch (err) {
        console.error('Erro ao autenticar usuário:', err);
        res.status(500).send('Erro ao autenticar usuário');
    }
});

  
app.get('/api/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Erro ao sair');
        }
        res.redirect('/');
    });
});

// Rotas protegidas por autenticação
app.get('/api/clientes', checkAuth, async (req, res) => {
    try {
        const result = await pool.query('SELECT codigo_sistema, agn_st_fantasia, cnpj, cidade, endereco, numero FROM clientes_representantes');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro no servidor');
    }
});

app.get('/api/representantes', checkAuth, async (req, res) => {
    try {
        const result = await pool.query('SELECT codigo_representante, representante FROM representante');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro no servidor');
    }
});

app.post('/api/salvar-visita', checkAuth, async (req, res) => {
    const { representante, dataHora, motivoVisita, produto, conclusaoVisita, conclusoesGerais } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO visitas (representante, data_hora, motivo_visita, produto, conclusao_visita, conclusoes_gerais) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [representante, dataHora, motivoVisita, produto, conclusaoVisita, conclusoesGerais]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao salvar os dados');
    }
});

// Rota para servir o login.html
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
