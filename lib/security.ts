// Security utilities

import crypto from 'crypto'

// Sanitizar input para prevenir XSS
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < e >
    .trim()
}

// Sanitizar HTML
export function sanitizeHTML(html: string): string {
  return html
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

// Validar email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validar URL
export function isValidURL(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Validar OAB
export function isValidOAB(oab: string, state: string): boolean {
  // Validação básica: apenas números e não vazio
  const oabRegex = /^\d{3,7}$/
  const validStates = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ]
  
  return oabRegex.test(oab) && validStates.includes(state)
}

// Gerar token seguro
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

// Hash seguro (além do bcrypt para senhas)
export function hashData(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex')
}

// Encriptar dados sensíveis (AES-256)
export function encrypt(text: string): string {
  const algorithm = 'aes-256-cbc'
  const key = Buffer.from(process.env.ENCRYPTION_KEY || 'default-key-change-this-32chars', 'utf8').subarray(0, 32)
  const iv = crypto.randomBytes(16)
  
  const cipher = crypto.createCipheriv(algorithm, key, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  return iv.toString('hex') + ':' + encrypted
}

// Decriptar dados
export function decrypt(text: string): string {
  const algorithm = 'aes-256-cbc'
  const key = Buffer.from(process.env.ENCRYPTION_KEY || 'default-key-change-this-32chars', 'utf8').subarray(0, 32)
  
  const parts = text.split(':')
  const iv = Buffer.from(parts[0], 'hex')
  const encryptedText = parts[1]
  
  const decipher = crypto.createDecipheriv(algorithm, key, iv)
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}

// Validar força da senha
export function validatePasswordStrength(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Senha deve ter pelo menos 8 caracteres')
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Senha deve conter letras minúsculas')
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Senha deve conter letras maiúsculas')
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Senha deve conter números')
  }
  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push('Senha deve conter caracteres especiais')
  }
  
  return {
    valid: errors.length === 0,
    errors,
  }
}

// Verificar palavras ofensivas
export function containsOffensiveWords(text: string): boolean {
  const offensiveWords = [
    'idiota', 'burro', 'imbecil', 'estupido', 'otario',
    'lixo', 'merda', 'porcaria', 'incompetente', 'vagabundo'
  ]
  
  const lowerText = text.toLowerCase()
  return offensiveWords.some(word => lowerText.includes(word))
}

// Limpar slug
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Validar CNPJ (para empresas)
export function isValidCNPJ(cnpj: string): boolean {
  cnpj = cnpj.replace(/[^\d]/g, '')
  
  if (cnpj.length !== 14) return false
  if (/^(\d)\1{13}$/.test(cnpj)) return false
  
  // Validação dos dígitos verificadores
  let length = cnpj.length - 2
  let numbers = cnpj.substring(0, length)
  const digits = cnpj.substring(length)
  let sum = 0
  let pos = length - 7
  
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--
    if (pos < 2) pos = 9
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== parseInt(digits.charAt(0))) return false
  
  length = length + 1
  numbers = cnpj.substring(0, length)
  sum = 0
  pos = length - 7
  
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--
    if (pos < 2) pos = 9
  }
  
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== parseInt(digits.charAt(1))) return false
  
  return true
}

// Máscara para telefone
export function formatPhone(phone: string): string {
  phone = phone.replace(/\D/g, '')
  
  if (phone.length === 11) {
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  } else if (phone.length === 10) {
    return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  
  return phone
}
