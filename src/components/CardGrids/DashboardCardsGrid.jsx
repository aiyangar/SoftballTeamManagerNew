import React from 'react'
import DashboardCard from '../Cards/DashboardCard'

/**
 * Componente para la cuadrícula de tarjetas del dashboard
 * @param {Array} cards - Array de datos de las tarjetas
 * @param {boolean} loading - Estado de carga general
 */
const DashboardCardsGrid = ({ cards, loading }) => {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 dashboard-grid">
                {[...Array(8)].map((_, index) => (
                    <div key={index} className="bg-neutral-900 shadow rounded-lg pt-4 pb-6 px-6 min-h-64 flex flex-col border border-gray-700">
                        <div className="flex items-center justify-between mb-3">
                            <div className="h-6 bg-gray-700 rounded w-32 animate-pulse"></div>
                            <div className="w-16 h-16 bg-gray-700 rounded animate-pulse"></div>
                        </div>
                        <div className="flex-1 flex items-center justify-center">
                            <p className="text-gray-400">Cargando...</p>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 dashboard-grid">
            {cards.map((cardData, index) => (
                <DashboardCard key={index} cardData={cardData} />
            ))}
        </div>
    )
}

export default DashboardCardsGrid
