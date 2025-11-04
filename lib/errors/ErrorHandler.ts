// lib/errors/ErrorHandler.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "No autenticado") {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "No autorizado") {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Recurso no encontrado") {
    super(message, 404);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = "Error de base de datos") {
    super(message, 500);
  }
}

// Logger centralizado
export const logger = {
  error: (message: string, error?: unknown) => {
    console.error(`[ERROR] ${message}`, error);
    // TODO: Integrar con servicio de logging (Sentry, LogRocket, etc.)
  },
  warn: (message: string, data?: unknown) => {
    console.warn(`[WARN] ${message}`, data);
  },
  info: (message: string, data?: unknown) => {
    console.info(`[INFO] ${message}`, data);
  },
  debug: (message: string, data?: unknown) => {
    if (process.env.NEXT_PUBLIC_ENABLE_DEBUG === "true") {
      console.debug(`[DEBUG] ${message}`, data);
    }
  },
};
