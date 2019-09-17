import codecs

def unicode_to_str(start_hex, end_hex):
    _str = ''
    for i in range(start_hex, end_hex+1):
        hex_str = format(i, 'x').zfill(4)
        char = codecs.decode('\\u' + hex_str, 'unicode-escape')
        _str += char
    return _str

hiragana = unicode_to_str(0x3041, 0x3094)
katakana = unicode_to_str(0x30A1, 0x30FC)
alphabet = unicode_to_str(0x0021, 0x007E)


for char in hiragana:
    print(hex(ord(char))[2:].zfill(4))

print(hiragana)
print(katakana)
print(alphabet)