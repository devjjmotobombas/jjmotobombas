/**
 * Formata um número de telefone brasileiro para o padrão (XX) X XXXX-XXXX
 * @param phone - Número de telefone sem formatação
 * @returns Número formatado ou string vazia se inválido
 */
export const formatPhoneNumber = (phone: string | null | undefined): string => {
    if (!phone) return "";

    // Remove todos os caracteres não numéricos
    let cleanPhone = phone.replace(/\D/g, "");

    // Remove o código do país (55) se presente
    if (cleanPhone.length === 13 && cleanPhone.startsWith("55")) {
        cleanPhone = cleanPhone.substring(2);
    }

    // Verifica se tem 11 dígitos (celular) ou 10 dígitos (fixo)
    if (cleanPhone.length === 11) {
        // Celular: (XX) 9 XXXX-XXXX
        return cleanPhone.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, "($1) $2 $3-$4");
    } else if (cleanPhone.length === 10) {
        // Fixo: (XX) XXXX-XXXX
        return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }

    // Se não tiver 10 ou 11 dígitos, retorna o número original
    return phone;
};
