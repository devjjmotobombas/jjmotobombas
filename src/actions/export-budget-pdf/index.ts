"use server";

import { eq } from "drizzle-orm";
import jsPDF from "jspdf";

import { db } from "@/db";
import { budgetsTable, clientsTable, enterprisesTable } from "@/db/schema";
import { formatCurrency } from "@/helpers/currency";
import { formatPhoneNumber } from "@/helpers/phone";
import { actionClient } from "@/lib/next-safe-action";

import { exportBudgetPDFSchema } from "./schema";

export const exportBudgetPDF = actionClient
    .schema(exportBudgetPDFSchema)
    .action(async ({ parsedInput: { budgetId } }) => {


        // Buscar dados do orçamento com cliente e empresa
        const budget = await db
            .select({
                id: budgetsTable.id,
                items: budgetsTable.items,
                totalInCents: budgetsTable.totalInCents,
                validUntil: budgetsTable.validUntil,
                status: budgetsTable.status,
                createdAT: budgetsTable.createdAT,
                client: {
                    id: clientsTable.id,
                    name: clientsTable.name,
                    phoneNumber: clientsTable.phoneNumber,
                },
                enterprise: {
                    id: enterprisesTable.id,
                    name: enterprisesTable.name,
                    address: enterprisesTable.address,
                    number: enterprisesTable.number,
                    complement: enterprisesTable.complement,
                    city: enterprisesTable.city,
                    state: enterprisesTable.state,
                    phoneNumber: enterprisesTable.phoneNumber,
                    register: enterprisesTable.register,
                },
            })
            .from(budgetsTable)
            .innerJoin(enterprisesTable, eq(budgetsTable.enterpriseId, enterprisesTable.id))
            .innerJoin(clientsTable, eq(budgetsTable.clientId, clientsTable.id))
            .where(eq(budgetsTable.id, budgetId))
            .limit(1);

        if (!budget[0]) throw new Error("Budget not found");

        const budgetData = budget[0];

        // Criar PDF
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let yPosition = 20;

        // Aplicar cor de fundo #fafafa
        doc.setFillColor(250, 250, 250); // #fafafa em RGB
        doc.rect(0, 0, pageWidth, pageHeight, "F");

        // Carregar e adicionar logo da empresa
        try {
            const logoUrl = "https://wwzja24bxj5qlhdj.public.blob.vercel-storage.com/LogoJJWB.png";
            const logoResponse = await fetch(logoUrl);

            if (!logoResponse.ok) {
                throw new Error(`Erro ao buscar logo: ${logoResponse.status}`);
            }

            const logoBuffer = await logoResponse.arrayBuffer();
            const logoBase64 = Buffer.from(logoBuffer).toString("base64");
            const logoDataUrl = `data:image/png;base64,${logoBase64}`;

            // Adicionar logo (ajustar tamanho conforme necessário)
            const logoWidth = 40;
            const logoHeight = 40;
            const logoX = (pageWidth - logoWidth) / 2;
            const logoY = yPosition - 5;

            doc.addImage(logoDataUrl, "PNG", logoX, logoY, logoWidth, logoHeight);
            yPosition += logoHeight + 5;
        } catch (error) {
            console.error("Erro ao carregar logo:", error);
            // Se não conseguir carregar a logo, usar texto como fallback
            doc.setFont("helvetica", "bold");
            doc.setFontSize(20);
            doc.text("JJ Motobombas", pageWidth / 2, yPosition);
            yPosition += 10;
        }

        // Configurações de fonte para o nome da empresa
        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);

        // Nome da empresa abaixo da logo
        doc.text("JJ Motobombas", pageWidth / 2, yPosition, { align: "center" });
        yPosition += 10;

        // Informações da empresa
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);

        const enterpriseAddress = `${budgetData.enterprise.address}, ${budgetData.enterprise.number}`;
        const enterpriseComplement = budgetData.enterprise.complement ? `, ${budgetData.enterprise.complement}` : "";
        const enterpriseLocation = `${budgetData.enterprise.city} - ${budgetData.enterprise.state}`;

        doc.text(enterpriseAddress + enterpriseComplement, pageWidth / 2, yPosition, { align: "center" });
        yPosition += 5;
        doc.text(enterpriseLocation, pageWidth / 2, yPosition, { align: "center" });
        yPosition += 5;
        doc.text(`Tel: ${formatPhoneNumber(budgetData.enterprise.phoneNumber)}`, pageWidth / 2, yPosition, { align: "center" });
        yPosition += 5;
        doc.text(`CNPJ: ${budgetData.enterprise.register}`, pageWidth / 2, yPosition, { align: "center" });
        yPosition += 15;

        // Linha separadora
        doc.setLineWidth(0.5);
        doc.line(20, yPosition, pageWidth - 20, yPosition);
        yPosition += 10;

        // Título do orçamento
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("ORÇAMENTO", pageWidth / 2, yPosition, { align: "center" });
        yPosition += 10;

        // Número do orçamento
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.text(`Código: #${budgetData.id.slice(-6).toUpperCase()}`, 20, yPosition);
        yPosition += 8;

        // Data de criação
        const createdDate = new Date(budgetData.createdAT).toLocaleDateString("pt-BR");
        doc.text(`Data: ${createdDate}`, 20, yPosition);
        yPosition += 8;

        // Validade
        const validUntil = new Date(budgetData.validUntil).toLocaleDateString("pt-BR");
        doc.text(`Válido até: ${validUntil}`, 20, yPosition);
        yPosition += 15;

        // Dados do cliente
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("DADOS DO CLIENTE", 20, yPosition);
        yPosition += 8;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(`Nome: ${budgetData.client.name}`, 20, yPosition);
        yPosition += 6;
        doc.text(`Telefone: ${formatPhoneNumber(budgetData.client.phoneNumber)}`, 20, yPosition);
        yPosition += 15;

        // Itens do orçamento
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("ITENS DO ORÇAMENTO", 20, yPosition);
        yPosition += 10;

        // Cabeçalho da tabela
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text("Produto", 20, yPosition);
        doc.text("Qtd", 120, yPosition);
        doc.text("Preço Unit.", 140, yPosition);
        doc.text("Total", 180, yPosition);
        yPosition += 5;

        // Linha separadora da tabela
        doc.setLineWidth(0.3);
        doc.line(20, yPosition, pageWidth - 20, yPosition);
        yPosition += 8;

        // Itens
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);

        const items = budgetData.items as unknown as Array<{
            productName: string;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
        }>;

        items.forEach((item) => {
            // Verificar se precisa de nova página
            if (yPosition > pageHeight - 30) {
                doc.addPage();
                yPosition = 20;
            }

            // Nome do produto (pode quebrar linha se muito longo)
            const productName = item.productName.length > 30
                ? item.productName.substring(0, 30) + "..."
                : item.productName;

            doc.text(productName, 20, yPosition);
            doc.text(item.quantity.toString(), 120, yPosition);
            doc.text(formatCurrency(item.unitPrice / 100), 140, yPosition);
            doc.text(formatCurrency(item.totalPrice / 100), 180, yPosition);
            yPosition += 6;
        });

        yPosition += 10;

        // Linha separadora antes do total
        doc.setLineWidth(0.5);
        doc.line(20, yPosition, pageWidth - 20, yPosition);
        yPosition += 10;

        // Total
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("SUBTOTAL:", 20, yPosition);
        doc.text(formatCurrency(budgetData.totalInCents / 100), 180, yPosition);
        yPosition += 20;

        // Status do orçamento
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        const statusText = budgetData.status === "offered" ? "Ofertado" :
            budgetData.status === "sold" ? "Vendido" :
                budgetData.status === "canceled" ? "Cancelado" : "Expirado";
        doc.text(`Status: ${statusText}`, 20, yPosition);
        yPosition += 20;

        // Rodapé
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.text("Este orçamento é válido conforme prazo estabelecido.", pageWidth / 2, pageHeight - 20, { align: "center" });
        doc.text("Para mais informações, entre em contato conosco.", pageWidth / 2, pageHeight - 15, { align: "center" });

        // Gerar nome do arquivo
        const fileName = `orcamento_${budgetData.id.slice(-6).toUpperCase()}_${budgetData.client.name.replace(/\s+/g, '_')}.pdf`;

        // Converter para blob e retornar
        const pdfBlob = doc.output("blob");
        const arrayBuffer = await pdfBlob.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");

        return {
            success: true,
            data: {
                fileName,
                base64,
            },
        };
    });
