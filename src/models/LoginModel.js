//ATENÇÃO!
// O código está comentado dessa maneira, apenas para objetivo de estudo.


const mongoose = require('mongoose'); // Modelagem de dados para o mongoDB
const validator = require('validator'); // Valida o email
const bcryptjs = require('bcryptjs'); // Cria o hash de senha

// Nosso modelo de dados
const LoginSchema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true }

});

const LoginModel = mongoose.model('Login', LoginSchema);

class Login {
    constructor(body) {
        this.body = body;
        this.errors = [];
        this.user = null;
    }

    async login(){
        this.valida();
        if (this.errors.length > 0) return;

        // Verificando se já existe o email para fazer login, já está cadastrado na base de dados e definindo um erro caso o email já exista OU não.
        this.user = await LoginModel.findOne({email: this.body.email});
        if(!this.user){
            this.errors.push('Usuário ou senha inválidos');
            return;
        } 

        // bryptjs validando o hash, comparando a senha digitada com o HASH cadastrado na base dados.
        if(!bcryptjs.compareSync(this.body.password, this.user.password)){
            this.errors.push('Senha inválida');
            this.user = null;
            return;
        }
    }


    async register() {
        // Chamando o método que vai validar os dados.
        this.valida();

        // If de segurança para não deixar passar para a base de dados, forms que não estejam no modelo que queremos.
        // essa linha já tem uma funçao similar ao método valida(), porém estou usando ela redundamentemente aqui.
        // também usamos a mesma lógica dessa linha no loginController.js, dentro do exports.register.
        // aqui temos um return, para IMPEDIR que caso tenha alguma falha, o código continue executando.
        if (this.errors.length > 0) return;

        // Chechando se o usuário já tem cadastro.
        await this.haveUser();
        // Como estamos uma etapa após a primeira validação, estou checando novamente se existe algum erro
        //tipo: o usuário digitar o email que já está cadastrado na base de dados
        //return para impedir que por algum motivo o programa continue e escreva dados que não queremos na DB.
        if (this.errors.length > 0) return;

        // Configurando o Hash de senha.
        const salt = bcryptjs.genSaltSync();
        this.body.password = bcryptjs.hashSync(this.body.password, salt);

        // Cadastrando o usuário no DB.
        this.user = await LoginModel.create(this.body);
    }

    // Método para validar email, verificando se já existe algum email igual na base de dados.
    async haveUser() {
        this.user = await LoginModel.findOne({email: this.body.email});
        if (this.user) this.errors.push('Email já cadastrado na nossa base de dados.')
    }

    // Método para validar os dados, de acordo com o que precisamos que sejam inseridos.
    valida() {
        // Chamando método para entregar os dados limpos e na modelagem correta.
        this.cleanUp();

        // Validando (reverso) email através do pacote "validator".
        if (!validator.isEmail(this.body.email)) this.errors.push('Email inválido');

        // Validando senha através da modelagem que precisamos, entre 3 e 50 caracteres.
        if (this.body.password.length < 3 || this.body.password.length > 50) {
            this.errors.push('A senha precisa ter entre 3 e 50 caracteres.')
        }
    }

    // Tratando os dados para enviar para validação.
    cleanUp() {
        for (const key in this.body) {
            if (typeof this.body[key] != 'string') {
                this.body[key] = '';
            }
        }
        this.body = {
            email: this.body.email,
            password: this.body.password
        };
    }
}

module.exports = Login;