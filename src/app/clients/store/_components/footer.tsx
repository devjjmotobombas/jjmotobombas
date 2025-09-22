import { FileText, MapPin, Phone } from "lucide-react";

interface FooterProps {
    enterprise: {
        name: string;
        phoneNumber: string;
        address: string;
        number: string;
        complement: string | null;
        city: string;
        state: string;
        register: string;
    };
}

export function Footer({ enterprise }: FooterProps) {
    const formatPhoneNumber = (phone: string) => {
        // Remove todos os caracteres não numéricos
        const cleaned = phone.replace(/\D/g, '');

        // Se tem 11 dígitos (celular), formata como (XX) 9XXXX-XXXX
        if (cleaned.length === 11) {
            return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
        }

        // Se tem 10 dígitos (fixo), formata como (XX) XXXX-XXXX
        if (cleaned.length === 10) {
            return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
        }

        // Se não conseguir formatar, retorna o número original
        return phone;
    };

    const formatCNPJ = (cnpj: string) => {
        // Remove todos os caracteres não numéricos
        const cleaned = cnpj.replace(/\D/g, '');

        // Se tem 14 dígitos, formata como XX.XXX.XXX/XXXX-XX
        if (cleaned.length === 14) {
            return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12)}`;
        }

        // Se não conseguir formatar, retorna o CNPJ original
        return cnpj;
    };

    const fullAddress = `${enterprise.address}, ${enterprise.number}${enterprise.complement ? `, ${enterprise.complement}` : ''} - ${enterprise.city}/${enterprise.state}`;

    return (
        <footer className="bg-[#373737] text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {/* Informações da Empresa */}
                    <div>
                        <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-primary">
                            JJ Motobombas
                        </h3>
                        <div className="space-y-2 sm:space-y-3">
                            <div className="flex items-start space-x-3">
                                <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs sm:text-sm text-gray-300">Telefone</p>
                                    <p className="font-medium text-sm sm:text-base">{formatPhoneNumber(enterprise.phoneNumber)}</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs sm:text-sm text-gray-300">Endereço</p>
                                    <p className="font-medium text-sm sm:text-base">{fullAddress}</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs sm:text-sm text-gray-300">CNPJ</p>
                                    <p className="font-medium text-sm sm:text-base">{formatCNPJ(enterprise.register)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Horários de Funcionamento */}
                    <div>
                        <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-primary">
                            Horários de Funcionamento
                        </h3>
                        <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                            <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                                <span className="text-gray-300">Segunda - Sexta:</span>
                                <span className="font-medium">08:00 - 18:00</span>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                                <span className="text-gray-300">Sábado:</span>
                                <span className="font-medium">08:00 - 12:00</span>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                                <span className="text-gray-300">Domingo:</span>
                                <span className="font-medium">Fechado</span>
                            </div>
                        </div>
                    </div>

                    {/* Informações de Contato */}
                    <div className="sm:col-span-2 lg:col-span-1">
                        <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-primary">
                            Atendimento
                        </h3>
                        <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                            <p className="text-gray-300">
                                Estamos aqui para ajudar você a encontrar os melhores produtos de tecnologia.
                            </p>
                            <p className="text-gray-300">
                                Entre em contato conosco através do WhatsApp para um atendimento personalizado.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Linha divisória */}
                <div className="border-t border-gray-400 mt-6 sm:mt-8 pt-6 sm:pt-8">
                    <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
                        <div className="text-xs sm:text-sm text-gray-400 text-center sm:text-left">
                            © {new Date().getFullYear()} JJ Motobombas. Todos os direitos reservados.
                        </div>
                        <div className="flex items-center space-x-1 text-xs sm:text-sm text-gray-400">
                            <span>Desenvolvido por</span>
                            <span className="font-semibold text-primary">Grupo Synqia</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
