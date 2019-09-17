import numpy as np
import sys, json, re

def get_data():
    x_y = sys.stdin.readline()
    return x_y

'''
def append_json_to_file(data: dict, path_file: str) -> bool:
    with open(path_file, 'ab+') as f:              # ファイルを開く
        f.seek(0,2)                                # ファイルの末尾（2）に移動（フォフセット0）  
        if f.tell() == 0 :                         # ファイルが空かチェック
            f.write(json.dumps([data]).encode())   # 空の場合は JSON 配列を書き込む
        else :
            f.seek(-1,2)                           # ファイルの末尾（2）から -1 文字移動
            f.truncate()                           # 最後の文字を削除し、JSON 配列を開ける（]の削除）
            f.write(' , '.encode())                # 配列のセパレーターを書き込む
            f.write(json.dumps(data, ensure_ascii=False, indent=4).encode())     # 辞書を JSON 形式でダンプ書き込み
            f.write('}'.encode())                  # JSON 配列を閉じる
    return f.close() 
'''

def main():
    x_y = get_data()
    add_dict = json.loads(x_y)        
    try:    
        read_f = open('ave_x_y.json', 'r')
        json_dict = json.load(read_f)
        json_dict.update(add_dict)
        write_f = open('ave_x_y.json', 'w')
        json.dump(json_dict, write_f, ensure_ascii=False, indent=4)
    except:
        write_f = open('ave_x_y.json', 'w')
        json.dump(add_dict, write_f, ensure_ascii=False, indent=4)
    finally:
        read_f.close()
        write_f.close()

if __name__ == "__main__":
    main()