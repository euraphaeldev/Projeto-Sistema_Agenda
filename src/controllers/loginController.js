const Login = require('../models/LoginModel'); //importando nosso modelo

//renderizando a págia login.ejs na rota do index
exports.index = (req, res) => {
    console.log(req.session.user); // debugando para ter certeza do login do usuario.
    if(req.session.user) return res.render('login-logado');
    return res.render('login');
};

// recebendo as informações do modelo LoginModel, validando e retornando para o usuário mensagens de error, sucess e tamb redirecionando para a nossa página de erro 404 (quando o erro não é um dos que queremos mostrar na própria página de login)
exports.register = async function (req, res) {
    try {
        const login = new Login(req.body);
        await login.register();

        if (login.errors.length != 0) {
            req.flash('errors', login.errors);
            req.session.save(function () {
                return res.redirect('/login/index');
            });
            return;
        }

        req.flash('success', 'Seu usuário foi criado com sucesso.');
        req.session.save(function () {
            return res.redirect('/login/index');
        });
    } catch (e) {
        console.log(e);
        return res.render('404');
    }
}

exports.login = async function (req, res){
    try {
        const login = new Login(req.body);
        await login.login();

        if (login.errors.length != 0) {
            req.flash('errors', login.errors);
            req.session.save(function () {
                return res.redirect('/login/index');
            });
            return;
        }

        req.flash('success', 'Login realizado com sucesso.');

        // Colocando o usuário dentro da sessão.
        req.session.user = login.user;

        req.session.save(function () {
            return res.redirect('/login/index');
        });
    } catch (e) {
        console.log(e);
        return res.render('404');
    }
};

exports.logout = function (req, res) {
    req.session.destroy();
    res.redirect('/login/index');
}