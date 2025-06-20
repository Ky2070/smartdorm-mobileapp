import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#f4f6fc",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#2e86de",
    textAlign: "center",
  },
  createButton: {
    backgroundColor: "#2e86de",
    padding: 14,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: "center",
  },
  invoiceCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  invoiceTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  modalOverlay: {
  flex: 1,
  justifyContent: "flex-end", // Đẩy modal xuống dưới
  backgroundColor: "rgba(0, 0, 0, 0.5)", // lớp nền mờ
  },
  modalContentPartial: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "80%", // hoặc bạn có thể dùng "70%" nếu muốn
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  label: {
    fontWeight: "600",
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalBtn: {
    flex: 1,
    marginHorizontal: 10,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  pickerWrapper: {
  borderWidth: 1,
  borderColor: "#ddd",
  borderRadius: 8,
  marginTop: 6,
},
picker: {
  height: 50,
  width: "100%",
},
});

export default styles;