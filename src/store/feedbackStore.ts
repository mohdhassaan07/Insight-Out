import axios from 'axios';
import { create } from 'zustand';

async function getFeedbackPage(page: number, limit: number) {
    const makeRequest = () =>
        axios.get("/api/v1/feedbacks", {
            params: { page, limit },
            withCredentials: true,
        });

    try {
        return await makeRequest();
    } catch (error) {
        // Retry once for transient failures (network hiccups / cold starts).
        return await makeRequest();
    }
}

type FeedbackStore = {
    feedbacks: Array<any>,
    allFeedbacks: Array<any>,
    loading: boolean,
    loadingMore: boolean;
    page: number;
    limit: number;
    hasMore: boolean;
    total: number;
    fetchFeedbacks: () => Promise<void>,
    loadMoreFeedbacks: () => Promise<void>,
    fetchAllFeedbacks: () => Promise<void>,
    updateApprovestatus: (id: string) => void,
    updateCategory: (id: string, category: string) => void,
    updateFeedbackFields: (id: string, fields: { primary_category?: string; sentiment?: string; source?: string }) => void
}

export const usefeedbackStore = create<FeedbackStore>((set, get) => ({
    feedbacks: [],
    allFeedbacks: [],
    loading: false,
    loadingMore: false,
    page: 1,
    limit: 20,
    hasMore: true,
    total: 0,

    fetchFeedbacks: async () => {
        const { limit, feedbacks } = get();
        if (feedbacks.length > 0) return; // avoid refetching if we already have data
        set({ loading: true, page: 1, hasMore: true });
        try {
            const res = await getFeedbackPage(1, limit);

            set({
                feedbacks: res.data.feedbacks,
                loading: false,
                page: res.data.page,
                hasMore: res.data.hasMore,
                total: res.data.total,
            });
        } catch (error) {
            console.error("Failed to fetch feedbacks", error);
            set({ loading: false, feedbacks: [], hasMore: false, total: 0, page: 1 });
        }
    },

    loadMoreFeedbacks: async () => {
        const { loadingMore, hasMore, page, limit } = get();
        if (loadingMore || !hasMore) return;

        set({ loadingMore: true });
        const nextPage = page + 1;

        try {
            const res = await getFeedbackPage(nextPage, limit);
            const nextFeedbacks = Array.isArray(res.data.feedbacks) ? res.data.feedbacks : [];
            const shouldHaveMore = nextFeedbacks.length > 0 && Boolean(res.data.hasMore);

            set((state) => ({
                feedbacks: [...state.feedbacks, ...nextFeedbacks].filter(
                    (feedback, index, array) => array.findIndex((item) => item.id === feedback.id) === index
                ),
                loadingMore: false,
                page: res.data.page,
                hasMore: shouldHaveMore,
                total: res.data.total,
            }));
        } catch (error) {
            console.error("Failed to load more feedbacks", error);
            set({ loadingMore: false });
        }
    },

    fetchAllFeedbacks: async () => {
        const { allFeedbacks } = get();
        if (allFeedbacks.length > 0) return; // avoid refetching if we already have data
        try {
            set({ loading: true })
            const res = await axios.get("/api/v1/fetchAllFeedbacks")
            set({
                allFeedbacks: res.data.feedbacks,
                loading: false
            })
        } catch (error) {
            console.error("Failed to fetch all feedbacks", error);
            set({ loading: false, allFeedbacks: [] });
        }
    },

    updateApprovestatus: (id) => {
        set((state) => ({
            feedbacks: state.feedbacks.map((fb) => {
                if (fb.id === id) {
                    return {
                        ...fb,
                        status: "auto_approved"
                    }
                }
                return fb;
            })
        }))
    },

    updateCategory: (id, category) => {
        set((state) => ({
            feedbacks: state.feedbacks.map((fb) => {
                if (fb.id === id) {
                    return {
                        ...fb,
                        primary_category: category
                    }
                }
                return fb;
            })
        }))
    },

    updateFeedbackFields: (id, fields) => {
        set((state) => ({
            feedbacks: state.feedbacks.map((fb) => {
                if (fb.id === id) {
                    return { ...fb, ...fields }
                }
                return fb;
            })
        }))
    }
}))