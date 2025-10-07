
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { getStockDashboardAction } from '@/actions/get-stock-dashboard'
import {
    PageActions,
    PageContainer,
    PageContent,
    PageDescription,
    PageHeader,
    PageHeaderContent,
    PageTitle,
} from '@/components/ui/page-container'
import type { StockDashboardResult } from '@/data/stock/get-stock-dashboard'
import { auth } from '@/lib/auth'

import { ABCAnalysisCard } from './_components/abc-analysis-card'
import { ExcessStockCard } from './_components/excess-stock-card'
import { LowStockAlertCard } from './_components/low-stock-alert-card'
import { StockMovementChart } from './_components/stock-movement-chart'
import StockPeriodControls from './_components/stock-period-controls'
import { StockSummaryCard, StockSummaryCardIcons } from './_components/stock-summary-card'
import { StockTopList } from './_components/stock-top-list'

export const metadata: Metadata = {
    title: 'JJMotobombas - Dashboard de Estoque',
}

interface PageProps {
    searchParams?: {
        startDate?: string;
        endDate?: string;
    };
}

export default async function StockDashboardPage({ searchParams }: PageProps) {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) redirect('/authentication')
    if (!session.user.enterprise) redirect('/enterprise-form')

    // `searchParams` may be a thenable in Next.js — await it before reading properties
    const awaitedSearchParams = await searchParams
    const startDate = awaitedSearchParams?.startDate
    const endDate = awaitedSearchParams?.endDate

    const result = await getStockDashboardAction({ startDate, endDate })
    // some actions may return { data } wrapper; accept both shapes
    const unwrapped = (() => {
        const r = result as unknown
        if (!r) return undefined
        // if it's an object with a 'data' property, return that
        if (typeof r === 'object' && r !== null && 'data' in (r as Record<string, unknown>)) {
            return (r as Record<string, unknown>).data as StockDashboardResult | undefined
        }
        return r as StockDashboardResult
    })()

    const data: StockDashboardResult = unwrapped || {
        totalProductsInStock: 0,
        totalStockValueInCents: 0,
        averageStockValueInCents: 0,
        productsWithLowStock: [],
        productsWithExcessStock: [],
        stockEntriesByPeriod: [],
        stockExitsByPeriod: [],
        abcAnalysis: [],
        mostMovedProducts: [],
        averageAcquisitionCost: 0,
        stockTurnoverRate: 0,
        periodComparison: { previousPeriodStockValueInCents: 0, stockValueGrowthRate: 0 },
    }

    return (
        <PageContainer>
            <PageHeader>
                <PageHeaderContent>
                    <PageTitle>Dashboard de Estoque</PageTitle>
                    <PageDescription>Visão geral do estoque e movimentações da empresa</PageDescription>
                </PageHeaderContent>
                <PageActions>
                    <StockPeriodControls />
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
                        <StockSummaryCard
                            title="Total de Produtos"
                            value={data.totalProductsInStock.toLocaleString('pt-BR')}
                            icon={StockSummaryCardIcons.totalProducts}
                            helpText="Mostra o número total de produtos cadastrados no sistema com estoque disponível. Esta métrica inclui todos os produtos ativos da empresa, independente da quantidade em estoque. É útil para ter uma visão geral do portfólio de produtos e acompanhar o crescimento do catálogo."
                        />
                        <StockSummaryCard
                            title="Valor Total do Estoque"
                            value={(data.totalStockValueInCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            icon={StockSummaryCardIcons.stockValue}
                            subtitle={data.periodComparison ? `${data.periodComparison.stockValueGrowthRate > 0 ? '+' : ''}${data.periodComparison.stockValueGrowthRate.toFixed(1)}% vs período anterior` : undefined}
                            trend={data.periodComparison ? (data.periodComparison.stockValueGrowthRate > 0 ? 'up' : data.periodComparison.stockValueGrowthRate < 0 ? 'down' : 'neutral') : undefined}
                            helpText="Calcula o valor total do estoque multiplicando a quantidade de cada produto pelo seu preço de compra. Esta métrica representa o investimento total em estoque e é fundamental para análise financeira. O crescimento positivo indica aumento do investimento em estoque, enquanto negativo pode indicar vendas ou ajustes."
                        />
                        <StockSummaryCard
                            title="Produtos com Estoque Baixo"
                            value={data.productsWithLowStock.length}
                            icon={StockSummaryCardIcons.lowStock}
                            helpText="Conta quantos produtos estão com estoque baixo ou crítico que precisam de reposição urgente. O estoque mínimo é calculado automaticamente como 10% do estoque atual ou 5 unidades, o que for maior. Esta métrica ajuda a priorizar compras e evitar rupturas de estoque que podem causar perda de vendas."
                        />
                        <StockSummaryCard
                            title="Taxa de Giro"
                            value={`${data.stockTurnoverRate.toFixed(1)}%`}
                            icon={StockSummaryCardIcons.turnover}
                            helpText="Calcula a taxa de giro do estoque dividindo o valor total das saídas pelo valor total do estoque, multiplicado por 100. Uma taxa alta indica que o estoque está sendo renovado rapidamente, enquanto uma taxa baixa pode indicar produtos com baixa rotatividade. Idealmente, deve estar entre 2-6% ao mês."
                        />
                    </div>

                    {/* Informações adicionais */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <StockSummaryCard
                            title="Custo Médio de Aquisição"
                            value={(data.averageAcquisitionCost / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            icon={StockSummaryCardIcons.stockValue}
                            helpText="Calcula o custo médio de aquisição por produto, dividindo o valor total investido em estoque pelo número total de produtos. Esta métrica ajuda a entender o investimento médio por item e pode ser útil para análise de rentabilidade e precificação. Valores altos podem indicar produtos de maior valor agregado."
                        />
                        <StockSummaryCard
                            title="Valor Médio por Produto"
                            value={(data.averageStockValueInCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            icon={StockSummaryCardIcons.totalProducts}
                            helpText="Mostra o valor médio de estoque por produto, calculado dividindo o valor total do estoque pelo número de produtos. Esta métrica indica a concentração de valor no portfólio e ajuda a identificar se há produtos de alto valor que merecem atenção especial na gestão de estoque."
                        />
                    </div>

                    {/* Gráfico de movimentação */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="lg:col-span-2">
                            <StockMovementChart
                                entries={data.stockEntriesByPeriod}
                                exits={data.stockExitsByPeriod}
                            />
                        </div>
                    </div>

                    {/* Análise ABC */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ABCAnalysisCard items={data.abcAnalysis} />
                        <StockTopList
                            title="Produtos Mais Movimentados"
                            items={data.mostMovedProducts.map((p) => ({
                                id: p.productId,
                                title: p.name,
                                value: p.totalMovements,
                                subtitle: `${p.category} • +${p.entries} / -${p.exits}`
                            }))}
                            helpText="Lista os produtos com maior movimentação de estoque no período selecionado, incluindo tanto entradas (compras/reposições) quanto saídas (vendas/ajustes). O total de movimentos é a soma de todas as entradas e saídas. Esta métrica ajuda a identificar quais produtos têm maior rotatividade e demanda, sendo importantes para o planejamento de compras e gestão de estoque."
                        />
                    </div>

                    {/* Alertas e análises */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <LowStockAlertCard items={data.productsWithLowStock} />
                        <ExcessStockCard items={data.productsWithExcessStock} />
                    </div>
                </div>
            </PageContent>
        </PageContainer>
    )
}
