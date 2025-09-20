"use client";

import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatPhoneNumber } from "@/helpers/phone";

interface WhatsAppButtonProps {
    phoneNumber: string;
    message?: string;
    className?: string;
}

export function WhatsAppButton({
    phoneNumber,
    message = "Olá! Vim pelo seu site e gostaria de saber mais sobre os produtos da JJ Motobombas.",
    className = ""
}: WhatsAppButtonProps) {
    const handleWhatsAppClick = () => {
        const cleanPhone = phoneNumber.replace(/\D/g, "");
        const whatsappUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, "_blank");
    };

    return (
        <Button
            onClick={handleWhatsAppClick}
            className={`bg-green-600 hover:bg-green-700 text-white ${className}`}
        >
            <MessageCircle className="h-4 w-4" />
            WhatsApp: {formatPhoneNumber(phoneNumber)}
        </Button>
    );
}
