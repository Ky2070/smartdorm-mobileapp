// RoomSwap.styles.js
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f2f6fc',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2c3e50',
  },
  label: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: '500',
    color: '#34495e',
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#dfe6e9',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginTop: 6,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  roomItem: {
    padding: 14,
    marginVertical: 6,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dfe6e9',
  },
  selectedRoom: {
    borderColor: '#2980b9',
    backgroundColor: '#ecf5ff',
  },
  roomName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34495e',
  },
  roomCapacity: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: '#2980b9',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#7f8c8d',
    fontSize: 16,
  },
  roomImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    marginLeft: 6,
    color: '#555',
  },
});

export default styles;