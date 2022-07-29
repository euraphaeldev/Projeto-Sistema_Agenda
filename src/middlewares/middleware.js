//exportando variaveis de erro globais, que podem ser acessadas através desse middleware em qualquer lugar da nossa aplicação.
exports.middlewareGlobal = (req, res, next) => {
    res.locals.errors = req.flash('errors');
    res.locals.success = req.flash('success');
    res.locals.user = req.session.user;
    next();
};

//exportando erro de sessão.
exports.checkCsrfError = (err, req, res, next) => {
    if (err) {
        return res.render('404');
    }
    next();
}

//exportando token de cada sessão de cada usuário
exports.csrfMiddleware = (req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
}