import SummaryApi from "../common";
import axiosInstance from "../utils/axiosInstance";

const fetchCategoryWiseProduct = async (category) => {
    try {
        const response = await axiosInstance.post(SummaryApi.categoryWiseProduct.url, {
            category: category
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching products for category ${category}:`, error);
        // Devuelve una estructura de error consistente
        return { success: false, message: error.message, data: [] };
    }
}

export default fetchCategoryWiseProduct;