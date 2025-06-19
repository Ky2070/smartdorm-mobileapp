import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  label: {
    fontSize: 16,
    color: '#555',
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 16
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: '#fff'
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8
  },
  radioLabel: {
    marginRight: 16,
    fontSize: 16
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#ccc',
  },
});

export default styles;