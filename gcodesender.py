import serial
import time

def removeComment(string):
	if (string.find(';')==-1): # ';' is not found
		return string
	else:
		return string[:string.index(';')]
 
# Open Serial Port
s = serial.Serial("/dev/tty.usbmodem1411",115200)
print('Opening Serial Port')
 
# Open Gcode File
file_name = 'testGcode2.gcode'

f = open(file_name,'r')
print('Opening' + file_name + ' ...')
 
time.sleep(2)
s.flushInput() 
print('Sending Gcode...') 

for line in f:
	l = removeComment(line)
	l = l.strip()
	if  (l.isspace()==False and len(l)>0) :
		print(' : ' + l)
		s.write((l + '\n').encode())
		grbl_out = s.readline()
		print(' : ' + (grbl_out.strip()).decode())
 
f.close()
s.close()