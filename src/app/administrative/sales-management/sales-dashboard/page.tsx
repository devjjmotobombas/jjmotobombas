import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { getSaleDashboardAction } from '@/actions/get-sale-dashboard'
import {
    PageActions,
    PageContainer,
    PageContent,
    PageDescription,
    PageHeader,
    PageHeaderContent,
    PageTitle,
} from '@/components/ui/page-container'
import type { SaleDashboardResult } from '@/data/sale/get-sale-dashboard'
import { auth } from '@/lib/auth'

import { CategoryList } from './_components/category-list'
import { ConversionCard } from './_components/conversion-card'
import { PaymentMethodsCard } from './_components/payment-methods-card'
import PeriodControls from './_components/period-controls'
import { RevenueChart } from './_components/revenue-chart'
import { SummaryCard, SummaryCardIcons } from './_components/summary-card'
import { TopList } from './_components/top-list'

export const metadata: Metadata = {
    title: 'JJMotobombas - Dashboard',
}

export default async function SalesDashboardPage({ searchParams }: { searchParams?: { startDate?: string; endDate?: string } } = {}) {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) redirect('/authentication')
    if (!session.user.enterprise) redirect('/enterprise-form')

    // `searchParams` may be a thenable in Next.js — await it before reading properties
    const awaitedSearchParams = await searchParams
    const startDate = awaitedSearchParams?.startDate
    const endDate = awaitedSearchParams?.endDate

    const result = await getSaleDashboardAction({ startDate, endDate })
    // some actions may return { data } wrapper; accept both shapes
    const unwrapped = (() => {
        const r = result as unknown
        if (!r) return undefined
        // if it's an object with a 'data' property, return that
        if (typeof r === 'object' && r !== null && 'data' in (r as Record<string, unknown>)) {
            return (r as Record<string, unknown>).data as SaleDashboardResult | undefined
        }
        return r as SaleDashboardResult
    })()

    const data: SaleDashboardResult = unwrapped || {
        totalRevenueInCents: 0,
        totalSalesCount: 0,
        averageTicketInCents: 0,
        estimatedGrossMarginInCents: 0,
        topProductsByVolume: [],
        topProductsByValue: [],
        topClients: [],
        budgetToSaleConversion: { budgetsCount: 0, convertedToSales: 0, conversionRate: 0 },
        periodComparison: { previousPeriodRevenueInCents: 0, revenueGrowthRate: 0 },
        paymentMethods: [],
        salesByCategory: [],
        revenueByDay: [],
    }

    return (
        <PageContainer>
            <PageHeader>
                <PageHeaderContent>
                    <PageTitle>Dashboard de Vendas</PageTitle>
                    <PageDescription>Visão geral das vendas e desempenho da empresa</PageDescription>
                </PageHeaderContent>
                <PageActions>
                    <PeriodControls />
                </PageActions>
            </PageHeader>
            <PageContent>
                <div className="space-y-8">
                    {/* Filtros de período */}
                    <div className="bg-card border rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-4">Filtrar por Período</h3>
                        <form method="get" className="flex flex-col sm:flex-row gap-4 items-end">
                            <div className="flex-1">
                                <label className="text-sm font-medium text-muted-foreground">Data de Início</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    defaultValue={startDate || ''}
                                    className="block mt-1 w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-sm font-medium text-muted-foreground">Data de Fim</label>
                                <input
                                    type="date"
                                    name="endDate"
                                    defaultValue={endDate || ''}
                                    className="block mt-1 w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
                            >
                                Aplicar Filtro
                            </button>
                        </form>
                    </div>

                    {/* Cards de resumo */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <SummaryCard
                            title="Faturamento Total"
                            value={(data.totalRevenueInCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            icon={SummaryCardIcons.revenue}
                            subtitle={data.periodComparison ? `${data.periodComparison.revenueGrowthRate > 0 ? '+' : ''}${data.periodComparison.revenueGrowthRate.toFixed(1)}% vs período anterior` : undefined}
                            trend={data.periodComparison ? (data.periodComparison.revenueGrowthRate > 0 ? 'up' : data.periodComparison.revenueGrowthRate < 0 ? 'down' : 'neutral') : undefined}
                            helpText="Mostra o faturamento total das vendas no período selecionado. É calculado somando o valor de todas as vendas realizadas. O crescimento em relação ao período anterior indica se o negócio está expandindo. Valores são baseados no preço de venda dos produtos."
                        />
                        <SummaryCard
                            title="Total de Vendas"
                            value={data.totalSalesCount.toLocaleString('pt-BR')}
                            icon={SummaryCardIcons.sales}
                            helpText="Conta o número total de transações de venda realizadas no período. Cada venda é contada como uma transação única, independente da quantidade de produtos vendidos. Esta métrica ajuda a entender a frequência de vendas e o volume de transações."
                        />
                        <SummaryCard
                            title="Ticket Médio"
                            value={(data.averageTicketInCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            icon={SummaryCardIcons.growth}
                            helpText="Calcula o valor médio por venda, dividindo o faturamento total pelo número de vendas. Um ticket médio alto indica que os clientes estão comprando produtos de maior valor ou em maior quantidade. Esta métrica é importante para estratégias de upselling."
                        />
                        <SummaryCard
                            title="Margem Estimada"
                            value={(data.estimatedGrossMarginInCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            icon={SummaryCardIcons.revenue}
                            helpText="Calcula a margem bruta estimada subtraindo o custo de aquisição do preço de venda, multiplicado pela quantidade vendida. Esta métrica indica a lucratividade das vendas e ajuda a avaliar a saúde financeira do negócio."
                        />
                    </div>

                    {/* Gráfico de receita e conversão */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <RevenueChart data={data.revenueByDay} />
                        </div>
                        <div>
                            <ConversionCard
                                budgetsCount={data.budgetToSaleConversion.budgetsCount}
                                convertedToSales={data.budgetToSaleConversion.convertedToSales}
                                conversionRate={data.budgetToSaleConversion.conversionRate}
                            />
                        </div>
                    </div>

                    {/* Produtos mais vendidos */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <TopList
                            title="Produtos mais vendidos por volume"
                            items={data.topProductsByVolume.map((p) => ({
                                id: p.productId,
                                title: p.name,
                                value: p.qty,
                                subtitle: `${(p.totalValueInCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
                            }))}
                            helpText="Lista os produtos que tiveram maior quantidade vendida no período selecionado. Ordenados pela quantidade total de unidades vendidas. Esta métrica ajuda a identificar os produtos mais populares e com maior demanda, sendo úteis para planejamento de estoque e estratégias de marketing."
                        />
                        <TopList
                            title="Produtos mais vendidos por valor"
                            items={data.topProductsByValue.map((p) => ({
                                id: p.productId,
                                title: p.name,
                                value: (p.totalValueInCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                                subtitle: `${p.qty} unidades`
                            }))}
                            helpText="Lista os produtos que geraram maior faturamento no período selecionado. Ordenados pelo valor total em reais vendido. Esta métrica ajuda a identificar os produtos mais lucrativos e com maior impacto no faturamento, sendo importantes para estratégias de precificação e mix de produtos."
                        />
                    </div>

                    {/* Análises adicionais */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1">
                            <PaymentMethodsCard methods={data.paymentMethods} />
                        </div>
                        <div className="lg:col-span-1">
                            <CategoryList categories={data.salesByCategory} />
                        </div>
                        <div className="lg:col-span-1">
                            <TopList
                                title="Clientes que mais compram"
                                items={data.topClients.map((c) => ({
                                    id: c.clientId,
                                    title: c.name,
                                    value: (c.totalSpentInCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                                    subtitle: `${c.orders} pedidos`
                                }))}
                                helpText="Lista os clientes que mais gastaram no período selecionado. Ordenados pelo valor total em reais gasto. Esta métrica ajuda a identificar os clientes mais valiosos (VIP), sendo importantes para estratégias de relacionamento, programas de fidelidade e ações de upselling direcionadas."
                            />
                        </div>
                    </div>
                </div>
            </PageContent>
        </PageContainer>
    )
}

