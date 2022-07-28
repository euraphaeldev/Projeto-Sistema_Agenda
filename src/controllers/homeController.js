exports.paginaInicial = (req, res) => {
    res.render('index', {
        titulo: "Minha Agenda",
        numeros: [0, 2, 4 ,6 ,7 , 9]
    });
}

exports.trataPost = (req, res) => {
    res.send(req.body)
}

