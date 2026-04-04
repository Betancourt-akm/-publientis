import React from 'react';
import { FaCheckCircle, FaCircle, FaTruck, FaBox, FaHome } from 'react-icons/fa';

const OrderTimeline = ({ status = 'pending', statusHistory = [] }) => {
  const steps = [
    { key: 'pending', label: 'Pedido Recibido', icon: FaBox },
    { key: 'processing', label: 'En Preparación', icon: FaBox },
    { key: 'shipped', label: 'En Camino', icon: FaTruck },
    { key: 'delivered', label: 'Entregado', icon: FaHome }
  ];

  const getStepIndex = (currentStatus) => {
    const index = steps.findIndex(step => step.key === currentStatus);
    return index >= 0 ? index : 0;
  };

  const currentStepIndex = getStepIndex(status);

  return (
    <div className="w-full py-8">
      <div className="relative">
        {/* Línea de progreso */}
        <div className="absolute top-5 left-0 w-full h-1 bg-gray-200">
          <div
            className="h-full bg-blue-600 transition-all duration-500"
            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Pasos */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const Icon = step.icon;

            return (
              <div key={step.key} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border-2 border-gray-300 text-gray-400'
                  } ${isCurrent ? 'ring-4 ring-blue-100' : ''}`}
                >
                  {isCompleted ? (
                    <FaCheckCircle className="text-lg" />
                  ) : (
                    <Icon className="text-sm" />
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p
                    className={`text-xs font-medium ${
                      isCompleted ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    {step.label}
                  </p>
                  {statusHistory[index]?.date && (
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(statusHistory[index].date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Historial detallado */}
      {statusHistory.length > 0 && (
        <div className="mt-8 space-y-3">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Historial de Estados
          </h4>
          {statusHistory.map((item, index) => (
            <div key={index} className="flex items-start gap-3 text-sm">
              <FaCircle className="text-blue-600 text-xs mt-1" />
              <div>
                <p className="text-gray-900 font-medium">{item.status}</p>
                <p className="text-gray-500 text-xs">
                  {new Date(item.date).toLocaleString()}
                </p>
                {item.note && (
                  <p className="text-gray-600 text-xs mt-1">{item.note}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderTimeline;
