import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import Apis, { authApis, endpoints } from "../../configs/Apis"; 
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from "./Styles/InvoiceStyles";


const InvoiceManagementScreen = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [token, setToken] = useState(null);
  const [feeTypes, setFeeTypes] = useState([]);
  const [invoiceDetails, setInvoiceDetails] = useState([
    { fee_type: "", amount: "" }
  ]);
  const [rooms, setRooms] = useState([]);
  // Form tạo hóa đơn
  const [roomId, setRoomId] = useState("");
  const [billingPeriod, setBillingPeriod] = useState("");

  const UNIT_CHOICES = [
    { value: "kWh", label: "kWh - Điện năng" },
    { value: "m³", label: "m³ - Nước" },
    { value: "người", label: "Người" },
    { value: "tháng", label: "Tháng" },
  ];

  useEffect(() => {
    const loadToken = async () => {
      const storedToken = await AsyncStorage.getItem("token");
      if (storedToken) {
        setToken(storedToken);
        fetchInvoices(storedToken);
        fetchRooms(storedToken);
      }
    };
    loadToken();
  }, []);

  const fetchRooms = async (tk) => {
    try {
      const res = await authApis(tk).get(endpoints["register-room"]);

      const activeRegs = res.data;

      const roomList = activeRegs
        .filter((reg) => reg.is_active)
        .map((reg) => ({
          id: reg.room.id,
          name: reg.room.name,
          building: {
            name: reg.building_name,
          },
        }));

      const uniqueRooms = roomList.filter(
        (room, index, self) =>
          index ===
          self.findIndex(
            (r) =>
              r.name === room.name && r.building.name === room.building.name
          )
      );

      setRooms(uniqueRooms);
    } catch (error) {
      console.error("Lỗi tải danh sách phòng", error);
      Alert.alert("Lỗi", "Không thể tải danh sách phòng.");
    }
  };

  const fetchInvoices = async (tk) => {
    try {
      setLoading(true);
      const res = await authApis(tk).get(endpoints['invoices']);
      setInvoices(res.data);
    } catch (error) {
      console.error(error);
      Alert.alert("Lỗi", "Không thể tải danh sách hóa đơn.");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = async () => {
    setRoomId("");
    setBillingPeriod("");
    setInvoiceDetails([{ fee_type: "", quantity: "", unit_price: "", unit: "" }]);
    setModalVisible(true);

    try {
      const res = await Apis.get(endpoints['fee-type']);
      setFeeTypes(res.data);
    } catch (err) {
      Alert.alert("Lỗi", "Không thể tải danh sách loại phí.");
    }
  };
  const handleCreateInvoice = async () => {
    if (!roomId || !billingPeriod) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    if (invoiceDetails.some(d => !d.unit)) {
      Alert.alert("Lỗi", "Vui lòng chọn đơn vị tính cho tất cả các dòng phí.");
      return;
    }
    console.log({
        room: roomId,
        billing_period: billingPeriod,
        details: invoiceDetails
          .filter(d => d.fee_type && d.quantity && d.unit_price)
          .map(d => ({
            fee_type: d.fee_type,
            quantity: parseFloat(d.quantity),
            unit_price: parseFloat(d.unit_price),
            unit: d.unit || null
          }))
      });
    try {
      setLoading(true);
      await authApis(token).post(endpoints['invoices'], {
        room: roomId,
        billing_period: billingPeriod,
        details: invoiceDetails
          .filter(d => d.fee_type && d.quantity && d.unit_price)
          .map(d => ({
            fee_type: typeof d.fee_type === 'object' ? d.fee_type.id : d.fee_type,
            quantity: parseFloat(d.quantity),
            unit_price: parseFloat(d.unit_price),
            unit: d.unit || null
          }))
      });
      Alert.alert("Thành công", "Hóa đơn đã được tạo.");
      setModalVisible(false);
      fetchInvoices(token);
    } catch (error) {
      console.error("Lỗi tạo hóa đơn:", error.response?.status);
      const msg = error.response?.data?.detail || "Không thể tạo hóa đơn.";
      Alert.alert("Lỗi", msg);
    } finally {
      setLoading(false);
    }
  };

  const renderInvoiceItem = ({ item }) => {
    const totalAmount = item.invoice_details.reduce(
      (sum, d) => sum + parseFloat(d.amount),
      0
    );

    return (
      <View style={styles.invoiceCard}>
        <Text style={styles.invoiceTitle}>Room_ID: {item.room.name || item.room}</Text>
        <Text>
          Kỳ thanh toán:{" "}
          {new Date(item.billing_period).toLocaleDateString("vi-VN", {
            month: "2-digit",
            year: "numeric",
          })}
        </Text>

        {/* Chi tiết từng dòng phí */}
        <Text style={{ fontWeight: "bold", marginTop: 8 }}>Chi tiết phí:</Text>
        {item.invoice_details.map((detail) => (
          <Text key={detail.id} style={{ marginLeft: 8 }}>
            - {detail.fee_type.name}: {detail.quantity} {detail.unit} × {Number(detail.unit_price).toLocaleString()} VNĐ ={" "}
            {Number(detail.amount).toLocaleString()} VNĐ
          </Text>
        ))}

        <Text style={{ marginTop: 6 }}>
          <Text style={{ fontWeight: "600" }}>Tổng tiền: </Text>
          {totalAmount.toLocaleString()} VNĐ
        </Text>

        <Text style={{ color: item.is_paid ? "green" : "red", fontWeight: "600" }}>
          {item.is_paid ? "Đã thanh toán" : "Chưa thanh toán"}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quản lý hóa đơn</Text>

      <TouchableOpacity style={styles.createButton} onPress={openCreateModal}>
        <Icon name="add-circle-outline" size={20} color="#fff" />
        <Text style={{ color: "#fff", fontWeight: "bold", marginLeft: 8 }}>Tạo hóa đơn mới</Text>
      </TouchableOpacity>
      
      {loading ? (
        <ActivityIndicator size="large" color="#2e86de" style={{ marginTop: 20 }} />
      ) : (
          <FlatList
            data={invoices}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderInvoiceItem}
            contentContainerStyle={{ paddingBottom: 100 }}
            ListEmptyComponent={<Text style={{ textAlign: "center", marginTop: 20 }}>Không có hóa đơn nào.</Text>}
          />
      )}
      

      {/* Modal tạo hóa đơn */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentPartial}>
            <Text style={styles.modalTitle}>Tạo hóa đơn mới</Text>
            <ScrollView>
              <Text style={styles.label}>ID phòng (room_id):</Text>
              <Text style={styles.label}>Chọn phòng:</Text>
                <View style={styles.pickerWrapper}>
                <Picker
                    selectedValue={roomId}
                    onValueChange={(itemValue) => {
                      console.log("Selected roomId:", itemValue);
                      setRoomId(itemValue)}}
                    style={styles.picker}>
                    <Picker.Item label="-- Chọn phòng --" value="" />
                    {rooms.map((room) => (
                    <Picker.Item key={room.id} label={`${room.building.name} - ${room.name}`} value={room.id} />
                    ))}
                </Picker>
                </View>

              <Text style={styles.label}>Kỳ thanh toán (YYYY-MM-DD):</Text>
              <TextInput
                style={styles.input}
                placeholder="Ví dụ: 2025-06-01"
                value={billingPeriod}
                onChangeText={setBillingPeriod}
              />

              <Text style={styles.label}>Chi tiết hóa đơn:</Text>
                {invoiceDetails.map((detail, index) => (
                  <View key={index} style={{ marginBottom: 12 }}>
                    <View style={styles.pickerWrapper}>
                      <Picker
                        selectedValue={detail.fee_type}
                        onValueChange={(val) => {
                          const updated = [...invoiceDetails];
                          updated[index].fee_type = val;
                          setInvoiceDetails(updated);
                        }}
                      >
                        <Picker.Item label="-- Chọn loại phí --" value="" />
                        {feeTypes.map((ft) => (
                          <Picker.Item key={ft.id} label={ft.name} value={ft.id} />
                        ))}
                      </Picker>
                    </View>

                    <TextInput
                      style={styles.input}
                      placeholder="Số lượng"
                      keyboardType="numeric"
                      value={detail.quantity?.toString() || ""}
                      onChangeText={(val) => {
                        const updated = [...invoiceDetails];
                        updated[index].quantity = val;
                        setInvoiceDetails(updated);
                      }}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Đơn giá"
                      keyboardType="numeric"
                      value={detail.unit_price?.toString() || ""}
                      onChangeText={(val) => {
                        const updated = [...invoiceDetails];
                        updated[index].unit_price = val;
                        setInvoiceDetails(updated);
                      }}
                    />
                    <Picker
                      selectedValue={detail.unit}
                      onValueChange={(val) => {
                        const updated = [...invoiceDetails];
                        updated[index].unit = val;
                        setInvoiceDetails(updated);
                      }}
                    >
                      <Picker.Item label="-- Chọn đơn vị --" value="" />
                      {UNIT_CHOICES.map((u) => (
                        <Picker.Item key={u.value} label={u.label} value={u.value} />
                      ))}
                    </Picker>
                  </View>
                ))}

                <TouchableOpacity
                  onPress={() => setInvoiceDetails([...invoiceDetails, { fee_type: "", quantity: "", unit_price: "" }])}
                  style={{ marginTop: 8 }}
                >
                  <Text style={{ color: "#2e86de" }}>+ Thêm dòng phí</Text>
                </TouchableOpacity>
            </ScrollView>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={[styles.modalBtn, { backgroundColor: "#ccc" }]}>
                <Text>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCreateInvoice} style={[styles.modalBtn, { backgroundColor: "#2e86de" }]}>
                <Text style={{ color: "white" }}>Tạo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default InvoiceManagementScreen;
