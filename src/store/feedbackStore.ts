import axios from 'axios';
import { create } from 'zustand';

type FeedbackStore = {
    feedbacks: Array<any>,
    loading: boolean,
    loadingMore: boolean;
    page: number;
    limit: number;
    hasMore: boolean;
    total: number;
    fetchFeedbacks: () => Promise<void>,
    loadMoreFeedbacks: () => Promise<void>,
    updateApprovestatus: (id: string) => void,
    updateCategory: (id: string, category: string) => void,
    updateFeedbackFields: (id: string, fields: { primary_category?: string; sentiment?: string; source?: string }) => void
}

export const usefeedbackStore = create<FeedbackStore>((set, get) => ({
    feedbacks: [],
    loading: false,
    loadingMore: false,
    page: 1,
    limit: 20,
    hasMore: true,
    total: 0,

    fetchFeedbacks: async () => {
        if (get().feedbacks.length > 0) return;
        const { limit } = get();
        set({ loading: true })
        const res = await axios.get("/api/v1/feedbacks", { params: { page: 1, limit: limit } });

        set({
            feedbacks: res.data.feedbacks,
            loading: false,
            page: res.data.page,
            hasMore: res.data.hasMore,
            total: res.data.total,
        });
    },

    loadMoreFeedbacks: async () => {
    const { loadingMore, hasMore, page, limit } = get();
    if (loadingMore || !hasMore) return;

    set({ loadingMore: true });
    const nextPage = page + 1;

    const res = await axios.get("/api/v1/feedbacks", {
      params: { page: nextPage, limit },
    });

    set((state) => ({
      feedbacks: [...state.feedbacks, ...res.data.feedbacks],
      loadingMore: false,
      page: res.data.page,
      hasMore: res.data.hasMore,
      total: res.data.total,
    }));
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