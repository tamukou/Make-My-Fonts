import serial

arduino = serial.Serial("/dev/tty.usbmodem1411", 115200)
arduino.write(b'G1 X10 Y10\n')
data = arduino.read_all() 
arduino.close()