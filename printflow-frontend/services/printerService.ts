import { api } from "./api";

export const getPrinters = async () => {
    const response =
        await api.get("/printers");

    return response.data;
};

export const getRecommendations =
    async (
        pages: number,
        copies: number,
        priorityLevel: string
    ) => {

        const response =
            await api.get(
                "/printers/recommendations",
                {
                    params: {
                        pages,
                        copies,
                        priorityLevel
                    }
                }
            );

        return response.data;
    };