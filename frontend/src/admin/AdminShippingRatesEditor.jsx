import React, { useState, useEffect } from "react";
import { CgClose } from "react-icons/cg";
import { MdDelete } from "react-icons/md";
import { toast } from "react-toastify";
import SummaryApi from "../common";

const AdminShippingRatesEditor = ({ onClose, fetchData }) => {
  const [shippingRates, setShippingRates] = useState([]);
  // Estados para agregar una nueva ciudad
  const [newCity, setNewCity] = useState("");
  const [newDefaultPrice, setNewDefaultPrice] = useState("");
  // Estados para agregar un barrio (se aplicarán a cualquier ciudad)
  const [newNeighborhood, setNewNeighborhood] = useState("");
  const [newNeighborhoodPrice, setNewNeighborhoodPrice] = useState("");

  useEffect(() => {
    fetchShippingRates();
  }, []);

  // Obtener las tarifas de envío desde el backend usando SummaryApi
  const fetchShippingRates = async () => {
    try {
      const response = await fetch(SummaryApi.shippingRates.url, {
        method: SummaryApi.shippingRates.method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setShippingRates(data);
    } catch (error) {
      console.error("Error al cargar las tarifas de envío:", error);
      toast.error("Error al cargar las tarifas de envío");
    }
  };

  // Agregar una nueva ciudad con su precio por defecto
  const handleAddCity = () => {
    if (!newCity || !newDefaultPrice) return;
    const newEntry = {
      city: newCity,
      default: Number(newDefaultPrice),
      neighborhoods: {},
    };
    setShippingRates([...shippingRates, newEntry]);
    setNewCity("");
    setNewDefaultPrice("");
  };

  // Eliminar una ciudad
  const handleDeleteCity = (city) => {
    setShippingRates(shippingRates.filter((rate) => rate.city !== city));
  };

  // Agregar un barrio a la ciudad indicada
  const handleAddNeighborhood = (city) => {
    if (!newNeighborhood || !newNeighborhoodPrice) return;
    setShippingRates(
      shippingRates.map((rate) => {
        if (rate.city === city) {
          return {
            ...rate,
            neighborhoods: {
              ...rate.neighborhoods,
              [newNeighborhood]: Number(newNeighborhoodPrice),
            },
          };
        }
        return rate;
      })
    );
    setNewNeighborhood("");
    setNewNeighborhoodPrice("");
  };

  // Eliminar un barrio de una ciudad
  const handleDeleteNeighborhood = (city, neighborhood) => {
    setShippingRates(
      shippingRates.map((rate) => {
        if (rate.city === city) {
          const updatedNeighborhoods = { ...rate.neighborhoods };
          delete updatedNeighborhoods[neighborhood];
          return { ...rate, neighborhoods: updatedNeighborhoods };
        }
        return rate;
      })
    );
  };

  // Guardar los cambios en el backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(SummaryApi.updateShippingRates.url, {
        method: SummaryApi.updateShippingRates.method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ shippingRates }),
      });
      const resData = await response.json();
      if (resData.success) {
        toast.success("Tarifas de envío actualizadas correctamente");
        onClose();
        fetchData();
      } else {
        toast.error(resData.message || "Error al actualizar las tarifas de envío");
      }
    } catch (error) {
      console.error("Error al actualizar las tarifas de envío:", error);
      toast.error("Error al actualizar las tarifas de envío");
    }
  };

  return (
    <div className="fixed w-full h-full bg-slate-200 bg-opacity-35 top-0 left-0 right-0 bottom-0 flex justify-center items-center">
      <div className="bg-white p-4 rounded w-full max-w-2xl h-full max-h-[80%] overflow-y-auto">
        <div className="flex justify-between items-center pb-3">
          <h2 className="font-bold text-lg">Editar Tarifas de Envío</h2>
          <div className="cursor-pointer" onClick={onClose}>
            <CgClose className="text-2xl hover:text-red-600" />
          </div>
        </div>
        <form onSubmit={handleSubmit} className="grid gap-2">
          <div className="border p-2">
            <h3 className="font-bold">Agregar Nueva Ciudad</h3>
            <input
              type="text"
              placeholder="Nombre de la ciudad"
              value={newCity}
              onChange={(e) => setNewCity(e.target.value)}
              className="p-2 border rounded w-full"
            />
            <input
              type="number"
              placeholder="Precio por defecto"
              value={newDefaultPrice}
              onChange={(e) => setNewDefaultPrice(e.target.value)}
              className="p-2 border rounded w-full mt-2"
            />
            <button
              type="button"
              onClick={handleAddCity}
              className="mt-2 bg-red-600 text-white p-2 rounded"
            >
              Agregar Ciudad
            </button>
          </div>

          {shippingRates.map((rate, idx) => (
            <div key={idx} className="border p-2">
              <div className="flex justify-between items-center">
                <h3 className="font-bold">{rate.city}</h3>
                <button
                  type="button"
                  onClick={() => handleDeleteCity(rate.city)}
                  className="text-red-600 hover:text-red-800"
                >
                  <MdDelete />
                </button>
              </div>
              <p>
                <strong>Precio por defecto:</strong> {rate.default}
              </p>
              <div>
                <h4 className="mt-2 font-bold">Barrios</h4>
                {Object.keys(rate.neighborhoods).length === 0 ? (
                  <p>No hay barrios agregados.</p>
                ) : (
                  <ul>
                    {Object.keys(rate.neighborhoods).map((neighborhood, index) => (
                      <li key={index} className="flex justify-between">
                        {neighborhood}: {rate.neighborhoods[neighborhood]}
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteNeighborhood(rate.city, neighborhood)
                          }
                          className="text-red-600 hover:text-red-800"
                        >
                          <MdDelete />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="mt-2">
                <input
                  type="text"
                  placeholder="Nombre del barrio"
                  value={newNeighborhood}
                  onChange={(e) => setNewNeighborhood(e.target.value)}
                  className="p-2 border rounded w-full"
                />
                <input
                  type="number"
                  placeholder="Precio del barrio"
                  value={newNeighborhoodPrice}
                  onChange={(e) => setNewNeighborhoodPrice(e.target.value)}
                  className="p-2 border rounded w-full mt-2"
                />
                <button
                  type="button"
                  onClick={() => handleAddNeighborhood(rate.city)}
                  className="mt-2 bg-red-600 text-white p-2 rounded"
                >
                  Agregar Barrio
                </button>
              </div>
            </div>
          ))}
          <button type="submit" className="mt-4 bg-red-600 text-white p-2 rounded">
            Guardar Cambios
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminShippingRatesEditor;
