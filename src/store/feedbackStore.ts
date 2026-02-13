import axios from 'axios';
import {create} from 'zustand';

type FeedbackStore = {
    feedbacks : Array<any>,
    loading : boolean,
    fetchFeedbacks : ()=> Promise<void>,
    updateApprovestatus : (id : string) => void
}

export const usefeedbackStore = create<FeedbackStore>((set, get)=>({
    feedbacks : [],
    loading : false,

    fetchFeedbacks : async() =>{
        if(get().feedbacks.length > 0) return;
        set({loading : true})
        const res = await axios("/api/v1/feedbacks");

        set({feedbacks : res.data.feedbacks, loading : false});
    },

    updateApprovestatus : (id) => {
        set((state) => ({
            feedbacks : state.feedbacks.map((fb) => {
                if(fb.id === id){
                    return {
                        ...fb,
                        status : "auto_approved"
                    }
                }
                return fb;
            })
        }))
    }
}))