// RoomStyles.js
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f6fc',
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
  },
  infoContainer: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#2980b9',
    fontWeight: '600',
  },
  capacityText: {
    marginLeft: 8,
    fontSize: 15,
    color: '#7f8c8d',
  },
  noRoomContainer: {
    marginTop: 100,
    alignItems: 'center',
  },
  noRoomText: {
    fontSize: 18,
    color: '#888',
  },
  swapButton: {
    marginTop: 16,
    backgroundColor: '#FF9800',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  swapButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  swapStatusContainer: {
    marginTop: 20,
    backgroundColor: '#f1f8e9',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#33691E',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  swapStatusTitle: {
    fontWeight: 'bold',
    color: '#33691E',
    fontSize: 16,
  },
  swapStatusText: {
    color: '#558B2F',
    marginTop: 8,
    fontSize: 15,
  },
  swapStatusRoom: {
    marginTop: 6,
    fontWeight: '600',
    color: '#33691E',
    fontSize: 15,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  genderTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecf0f1',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'center',
    marginBottom: 10,
  },
  genderText: {
    marginLeft: 4,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    width: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#2c3e50'
  },
  notificationItem: {
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingVertical: 8
  },
  notificationTitle: {
    fontWeight: 'bold',
    color: '#34495e'
  },
  notificationBody: {
    color: '#555'
  },
  notificationTime: {
    color: '#999',
    fontSize: 12,
    marginTop: 4
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: '#2980b9',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold'
  }
});

export default styles;
