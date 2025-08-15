import {create} from "zustand";
import {axiosInstance} from '../lib/axios'
//import { set } from "mongoose";

export const useAttendanceStore =  create((set) => ({
    chartData:{
        labels: [],
        present: [],
        absent: [],
        total: 0,
        present: 0,
        isoDate:null,
        loading:false,
        error: null
    },
    fetchStats: async () => {
        try {
            const res = await axiosInstance.get("/attendance/stats/monthly");
            set({
                chartData:{
                    labels: res.data.map(d => d.month),
                    present: res.data.map(d.present),
                    absent: res.data.map(d => d.absent)
                }
            })
        } catch (error) {
            console.log("Error fetching stats", error)
        }
    }
}));

fetchByDate: async (isoDate) => {
    try {
        set({loading: true, error: null})

        const res = await axiosInstance.get("/attendance/stats/daily");

        const data = await res.json();

        set({
            total: data.total,
            present: data.totalPresent,
            absent: data.totalAbsent,
            isoDate,
            prettyDate: new Date(data.date).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric"
            }),
            loading: false,
        })
    } catch (error) {
        set({loading: false, error: error.message || "Failed to load attendance"})
    }
}