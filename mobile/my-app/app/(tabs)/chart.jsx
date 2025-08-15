import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import AttendanceModal from "../../components/AttendanceModal";
import { useAttendanceStore } from "../../store/useAttendanceStore";

export default function chart() {

    const [open, setOpen] = useState(false);
    const { prettyDate, total, present, absent } = useAttendanceStore();

  return (
   <View style={styles.container}>
      <Text style={styles.header}>Attendance</Text>

      {/* Quick summary of last loaded day (optional) */}
      {prettyDate ? (
        <Text style={styles.subheader}>Last loaded: {prettyDate}</Text>
      ) : (
        <Text style={styles.subheader}>Pick a date to view attendance</Text>
      )}

      <View style={styles.quickCards}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Total</Text>
          <Text style={styles.cardValue}>{total}</Text>
        </View>
        <View style={[styles.card, styles.present]}>
          <Text style={styles.cardLabel}>Present</Text>
          <Text style={[styles.cardValue, { color: "#2e7d32" }]}>{present}</Text>
        </View>
        <View style={[styles.card, styles.absent]}>
          <Text style={styles.cardLabel}>Absent</Text>
          <Text style={[styles.cardValue, { color: "#c62828" }]}>{absent}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.cta} onPress={() => setOpen(true)}>
        <Text style={styles.ctaText}>View Attendance by Date</Text>
      </TouchableOpacity>

      <AttendanceModal visible={open} onClose={() => setOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  header: { fontSize: 22, fontWeight: "bold" },
  subheader: { marginTop: 4, color: "#666" },
  quickCards: { marginTop: 16 },
  card: {
    backgroundColor: "#F5F5F5",
    padding: 14,
    borderRadius: 10,
    marginVertical: 6,
  },
  present: { backgroundColor: "#E8F5E9" },
  absent: { backgroundColor: "#FFEBEE" },
  cardLabel: { fontSize: 14, color: "#555" },
  cardValue: { fontSize: 20, fontWeight: "bold", marginTop: 4 },
  cta: {
    marginTop: 16,
    backgroundColor: "#1976d2",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  ctaText: { color: "#fff", fontWeight: "600" },
});

  
