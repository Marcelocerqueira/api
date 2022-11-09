class UsersControllers {
  /**
   * index - GET para lista varios registros.
   * show - GET para exibir um registro especifico.
   * create - POST para cria um resgitro.
   * update - PUT para atualizar um registo.
   * delete - DELETE para remover um  registro.
   */
  create(request, response) {
    const { name, email, password } = request.body;

    response.json({ name, email, password });
  }
}

module.exports = UsersControllers;