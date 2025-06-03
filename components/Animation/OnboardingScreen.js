import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions
} from 'react-native';

const { width } = Dimensions.get('window');

const screens = [
  {
    title: 'Chào mừng bạn!',
    desc: 'Đây là ứng dụng quản lý ký túc xá sinh viên.',
  },
  {
    title: 'Quản lý tiện lợi',
    desc: 'Bạn có thể đăng ký phòng, xem hóa đơn, và nhiều hơn nữa.',
  }
];

const OnboardingScreen = ({ navigation }) => {
  const [step, setStep] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (step === screens.length - 1) {
      navigation.replace('MainApp');
    } else {
      Animated.timing(translateX, {
        toValue: -(step + 1) * width,
        duration: 300,
        useNativeDriver: true,
      }).start();
      setStep(step + 1);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.slider, {
        width: width * screens.length,
        transform: [{ translateX }],
      }]}>
        {screens.map((screen, index) => (
          <View key={index} style={[styles.slide, { width }]}>
            <Text style={styles.title}>{screen.title}</Text>
            <Text style={styles.desc}>{screen.desc}</Text>
          </View>
        ))}
      </Animated.View>

      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>
          {step === screens.length - 1 ? 'Bắt đầu ngay' : 'Tiếp tục'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff'
  },
  slider: {
    flexDirection: 'row', flexGrow: 0,
  },
  slide: {
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20,
  },
  title: {
    fontSize: 28, fontWeight: 'bold', marginBottom: 20, textAlign: 'center'
  },
  desc: {
    fontSize: 16, textAlign: 'center'
  },
  button: {
    position: 'absolute', bottom: 60,
    backgroundColor: '#2e86de', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 8
  },
  buttonText: {
    color: '#fff', fontSize: 16
  }
});