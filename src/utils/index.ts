// Formatação de CPF
export const formatCPF = (cpf: string): string => {
  // Remove tudo que não é dígito
  const cleaned = cpf.replace(/\D/g, '');
  
  // Aplica a máscara XXX.XXX.XXX-XX
  if (cleaned.length <= 11) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  
  return cleaned;
};

// Remove formatação do CPF
export const unformatCPF = (cpf: string): string => {
  return cpf.replace(/\D/g, '');
};

// Validação básica de CPF
export const isValidCPF = (cpf: string): boolean => {
  const cleaned = unformatCPF(cpf);
  
  // Verifica se tem 11 dígitos
  if (cleaned.length !== 11) return false;
  
  // Verifica se não são todos os dígitos iguais
  if (/^(\d)\1{10}$/.test(cleaned)) return false;
  
  return true;
};

// Formatação de telefone
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length <= 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  } else {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
};

// Remove formatação do telefone
export const unformatPhone = (phone: string): string => {
  return phone.replace(/\D/g, '');
};

// Formatação de data
export const formatDate = (date: string): string => {
  if (!date) return '';
  
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR');
};

// Formatação de data e hora
export const formatDateTime = (dateTime: string): string => {
  if (!dateTime) return '';
  
  const d = new Date(dateTime);
  return d.toLocaleString('pt-BR');
};

// Calcular idade baseada na data de nascimento
export const calculateAge = (birthDate: string): number => {
  if (!birthDate) return 0;
  
  const birth = new Date(birthDate);
  const today = new Date();
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

// Conversão de data para formato ISO
export const toISODate = (date: string): string => {
  if (!date) return '';
  
  const [day, month, year] = date.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

// Conversão de data ISO para formato brasileiro
export const fromISODate = (isoDate: string): string => {
  if (!isoDate) return '';
  
  const date = new Date(isoDate);
  return date.toLocaleDateString('pt-BR');
};

// Validação de email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Capitalizar primeira letra de cada palavra
export const capitalizeWords = (str: string): string => {
  return str.toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
};

// Truncar texto
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Remover acentos
export const removeAccents = (str: string): string => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

// Filtrar array por texto
export const filterByText = <T>(
  array: T[],
  searchText: string,
  getSearchableText: (item: T) => string
): T[] => {
  if (!searchText) return array;
  
  const normalizedSearch = removeAccents(searchText.toLowerCase());
  
  return array.filter(item => {
    const searchableText = removeAccents(getSearchableText(item).toLowerCase());
    return searchableText.includes(normalizedSearch);
  });
};

// Debounce function
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: number;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Gerar cor baseada em string (para avatars)
export const stringToColor = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 50%)`;
};

// Obter iniciais do nome
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
}; 