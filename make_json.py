import json
import codecs

def unicode_to_str(start_hex, end_hex):
    _str = ''
    for i in range(start_hex, end_hex+1):
        hex_str = format(i, 'x').zfill(4)
        char = codecs.decode('\\u' + hex_str, 'unicode-escape')
        _str += char
    return _str

def add_to_json(add_str, new_json):
    for char in add_str:
        UCS = hex(ord(char))[2:].zfill(4)
        new_json["results"].append({"UCS" : UCS, "character" : char, "stroke" : 0})

def main():
    new_json = {}
    new_json["results"] = []

    #///足したい文字をUnicodeで指定して追加
    hiragana = unicode_to_str(0x3041, 0x3094)
    add_to_json(hiragana, new_json)
    katakana = unicode_to_str(0x30A1, 0x30FC)
    add_to_json(katakana, new_json)
    alphabet = unicode_to_str(0x0021, 0x007E)
    add_to_json(alphabet, new_json)
    #///

    #///情報漢字を読み込んで追加
    read_f = open('jyouyou_kanji.json', 'r')
    json_dict = json.load(read_f)

    for i in range(0, len(json_dict['results'])):
        UCS = json_dict['results'][i]['UCS']['対応するUCS']
        char = codecs.decode('\\u' + UCS[2:], 'unicode-escape')
        new_json["results"].append({"UCS" : UCS[2:], "character" : char, "stroke" : json_dict['results'][i]['総画数'], })
    #///

    new_json["size"] = len(new_json['results'])

    write_f = open("character.json", "w")
    json.dump(new_json, write_f, ensure_ascii=False, indent=4)
    read_f.close()
    write_f.close()

if __name__ == "__main__":
    main()



