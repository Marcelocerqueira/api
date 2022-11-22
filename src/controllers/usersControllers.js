const { hash, compare } = require("bcryptjs");
const AppError = require("../utils/AppError");
const sqliteConnection = require("../database/sqlite");

class UsersControllers {
  /**
   * index - GET para lista varios registros.
   * show - GET para exibir um registro especifico.
   * create - POST para cria um resgitro.
   * update - PUT para atualizar um registo.
   * delete - DELETE para remover um  registro.
   */
  async create(request, response) {
    const { name, email, password } = request.body;

    const database = await sqliteConnection();
    const checkuserExists = await database.get("SELECT * FROM users WHERE email = (?)", [email])

    if (checkuserExists) {
      throw new AppError("Este e-mail já esta em uso.");
    }

    const hashedPassword = await hash(password, 8);

    await database.run(
      "INSERT INTO users (name,email,password) VALUES (?,?,?)",
      [name, email, hashedPassword]
    );

    return response.status(201).json();
  }

  async update(request, response) {
    const { name, email, password, old_password } = request.body;
    const { id } = request.params;

    const database = await sqliteConnection();
    const user = await database.get("SELECT * FROM users WHERE id = (?)", [id]);

    if (!user) {
      throw new AppError("Usuário nao encontrado");
    }

    const userWithUpdatedEmail = await database.get("SELECT * FROM users WHERE email = (?)", [email]);
    if (userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id) {
      throw new AppError("este e-mail la esta em uso");
    }

    user.name = name ?? user.name;
    user.email = email ?? user.email;

    if (password && !old_password) {
      throw new AppError("Você precisa informar a senha antiga para definir a nova senha")
    }

    if (password && old_password) {
      const checkOldPassword = await compare(old_password, user.password);

      if (!checkOldPassword) {
        throw new AppError("A senha nao confere.");
      }

      user.password = await hash(password, 8);
    }

    await database.run(`
      UPDATE users SET 
      name = ?,
      email = ?,
      password = ?,
      updated_at = DATETIME('now')
      WHERE id = ?`,
      [user.name, user.email, user.password, id]
    );

    return response.status(200).json();
  }
}

module.exports = UsersControllers;