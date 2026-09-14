export const MESSAGES = {
  auth: {
    emailOrUsernameTaken: 'E-mail ou usuário já cadastrado',
    invalidCredentials: 'Credenciais inválidas',
    forbidden: 'Você não tem permissão para acessar este recurso',
  },
  form: {
    passwordsMismatch: 'As senhas não coincidem.',
    loginFailed: 'Não foi possível entrar. Tente de novo.',
    signupFailed: 'Não foi possível criar a conta. Tente de novo.',
  },
  request: {
    genericError: 'Erro na requisição',
  },
  errorPage: {
    label: 'Erro 500',
    title: 'Algo deu errado por aqui',
    description:
      'Tivemos um problema inesperado ao carregar esta página. Você pode tentar de novo.',
    retry: 'Tentar de novo',
  },
} as const;
