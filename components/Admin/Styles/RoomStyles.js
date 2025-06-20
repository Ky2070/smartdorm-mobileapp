import { StyleSheet } from "react-native";


const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 12,
  },
  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  actions: {
    flexDirection: "row",
    marginTop: 10,
  },
  approveBtn: {
    backgroundColor: "green",
    padding: 8,
    borderRadius: 6,
    marginRight: 10,
  },
  rejectBtn: {
    backgroundColor: "red",
    padding: 8,
    borderRadius: 6,
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  filterContainer: {
    flexDirection: "row",
    marginVertical: 10,
    justifyContent: "space-around",
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#bbb",
    backgroundColor: "#f0f0f0",
  },
  activeFilter: {
    backgroundColor: "#4a90e2",
    borderColor: "#4a90e2",
  },
  filterText: {
    fontWeight: "bold",
    color: "#333",
  },
  activeFilterText: {
    color: "#fff",
  },
});

export default styles;