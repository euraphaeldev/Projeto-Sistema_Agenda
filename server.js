require ('dotenv').config();// passando parametros de conexão com o DB, porém esses dados não são públicos.

const { application, urlencoded } = require('express');
const express = require('express');
const app = express();
const mongoose = require('mongoose');

// definindo parâmetros de conexão
mongoose.connect(process.env.CONNECTIONSTRING).then(() => {
    // emitindo mensagem, para o servidor começar a escutar.
    app.emit('ready');
}).catch(e => console.log(e));


const session = require('express-session'); // usando módulo para criar sessões.
const MongoStore = require('connect-mongo'); // conexão com o mongo-db
const flash = require('connect-flash'); // usando o pacote flash para apresentar mensagens que se auto destroem para os usuários.



const routes = require('./routes');// usando o pacote de rotas.
const path = require('path'); // usando o path para definir caminhos a absolutos.
const helmet = require('helmet'); // importando o Helmet para segurança da aplicação.
const csrf = require('csurf'); // usando csurf para criação de tokens de sessão.

const {middlewareGlobal, checkCsrfError, csrfMiddleware} = require("./src/middlewares/middleware");//Desestruturação dos middlewares.


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.resolve(__dirname, 'public')));

app.use(helmet());

//configurando a sessão de cada login, aqui configuramos cookies e a identificando onde salvar essas informações de sessão.
const sessionOptions = session({
    secret: 'ninguem vai ler isso aqui!',
    store: MongoStore.create({ mongoUrl: process.env.CONNECTIONSTRING }),
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 24 * 7,
        httpOnly: true
    }
});


app.use(sessionOptions); // executando a conexão e armazenamento das sessões e cookies no DB.
app.use(flash()); // executando o módulo para apresentar mensagens de erros e sucessos que se auto destroem.


app.set('views', path.resolve(__dirname, 'src', 'views'));
app.set('view engine', 'ejs');

app.use(csrf()); // executando a criação de tokens para cada sessão.

//nossos proprios middlewares
app.use(middlewareGlobal);
app.use(checkCsrfError);
app.use(csrfMiddleware);
app.use(routes); // executando as rotas

app.on('ready', () => {
    app.listen(3000, () => {
        console.log('servidor executando na porta 3000');
        console.log('Acessar http://localhost:3000');
    });
})

