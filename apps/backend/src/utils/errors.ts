export class HttpError extends Error {
    constructor(message: string, public readonly statusCode: number) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class NotFoundError extends HttpError {
    constructor(message: string = 'Recurso no encontrado') {
        super(message, 404);
    }
}

export class ValidationError extends HttpError {
    constructor(message: string = 'Datos invalidos') {
        super(message, 422);
    }
}

export class PasswordError extends HttpError {
    constructor(message: string = 'Contraseña incorrecta') {
        super(message, 401);
    }
}

export class UserNotFoundError extends HttpError {
    constructor(message: string = 'Este usuario no existe') {
        super(message, 404);
    }
}

export class ExistsError extends HttpError {
    constructor(message: string = 'El usuario ya existe') {
        super(message, 409);
    }
}

export class UnauthorizedError extends HttpError {
    constructor(message: string = 'Acceso no autorizado') {
        super(message, 401);
    }
}
