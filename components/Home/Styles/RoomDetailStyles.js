// RoomDetailsStyles.js
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: { backgroundColor: '#f2f2f2' },
  image: {
    width: '100%',
    height: 220,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  infoText: { fontSize: 16, marginLeft: 6, color: '#555' },
  descriptionBox: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  descriptionTitle: { fontWeight: '600', fontSize: 16, marginBottom: 6 },
  dateBox: {
    backgroundColor: '#e6e6e6',
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
    fontSize: 16,
    color: '#333',
  },
  button: {
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default styles;
