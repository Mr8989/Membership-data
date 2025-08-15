import React, { useState } from "react";
import { View, Text, Button, Modal, StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import {useAttendanceStore} from "../store/useAttendanceStore";

export default function AttendanceModal() {
    const { total, present, absent, prettyDate, fetchByDate } = useAttendanceStore();
    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const handleConfirmDate = () => {
        const isoDate = selectedDate.toISOString().split("T")[0]; // YYYY-MM-DD
        fetchByDate(isoDate);
        setShowModal(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Attendance Report</Text>
            <Text style={styles.date}>{prettyDate || "No date selected"}</Text>

            <View style={styles.card}>
                <Text>Total Members: {total}</Text>
                <Text>Present: {present}</Text>
                <Text>Absent: {absent}</Text>
            </View>

            <Button title="Pick Date" onPress={() => setShowModal(true)} />

            {/* Date Picker Modal */}
            <Modal visible={showModal} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <DateTimePicker
                            value={selectedDate}
                            mode="date"
                            display="calendar"
                            onChange={(event, date) => date && setSelectedDate(date)}
                        />
                        <View style={styles.modalButtons}>
                            <Button title="Cancel" onPress={() => setShowModal(false)} />
                            <Button title="Confirm" onPress={handleConfirmDate} />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#fff" },
    title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
    date: { fontSize: 16, marginBottom: 20, color: "gray" },
    card: { padding: 20, borderRadius: 10, backgroundColor: "#f0f0f0", marginBottom: 20 },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: { backgroundColor: "#fff", padding: 20, borderRadius: 10, width: "80%" },
    modalButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
});
