import numpy as np
import sys, json, re

def get_json():
    json_str = sys.stdin.readline()
    return json_str

def calc_f_t(a,b,p_num,max_p_num):
    n = len(a) - 1
    #t = np.arange(0, np.pi, 0.05)
    t = np.linspace(0, np.pi, p_num * 10)
    f_t = np.zeros(max_p_num)
    j = 0
    for k in range(0,len(t)):
        for i in range(1,n+1):
            f_t[j] += a[i] * np.cos(i * t[k]) + b[i] * np.sin(i * t[k])
        f_t[j] += a[0]/2
        f_t[j] = round(f_t[j], 5)
        j += 1
    '''
    file = open('./test_t.txt', 'w')
    file.write(str(f))
    file.close()
    '''
    return f_t

if __name__ == '__main__':
    _json = get_json()
    _dict = json.loads(_json)
    _dict = _dict.replace('\\','')
    x_y_a_b = json.loads(_dict)
    x_a_b = x_y_a_b["x"]
    y_a_b = x_y_a_b["y"]
    p_num = x_y_a_b["point_nums"]
    '''
    file = open('./test15.txt', 'w')
    file.write(str(x_a_b))
    file.close()
    '''
    #len(t)を得るためだけに生成。使わない
        #t = np.arange(0, np.pi, 0.05)
    max_p_num = max(p_num) * 10
    x = np.empty((0,max_p_num))
    y = np.empty((0,max_p_num))
    for i in range(0,len(x_a_b[0])):
        x = np.append(x, np.array([calc_f_t(x_a_b[0][i], x_a_b[1][i], p_num[i], max_p_num)]), axis=0)
        y = np.append(y, np.array([calc_f_t(y_a_b[0][i], y_a_b[1][i], p_num[i], max_p_num)]), axis=0)
    res_json = {}
    res_json["x"] = x.tolist()
    res_json["y"] = y.tolist()
    #file = open('./test18.txt', 'w')
    #file.write(str(res_json))
    #file.close()
    print(json.dumps(res_json))