#from scipy.interpolate import interp1d
from scipy import interpolate
import numpy as np
import matplotlib.pyplot as plt
import sys, json, re

def get_json():
    json_str = sys.stdin.readline()
    #json_str = json_str.replace('\\','')
    #file = open('./test3.txt', 'w')
    #for values in _dict.values():
    #file.write(json_str)
    #file.close()
    #_json = json.load(json_str)
    return json_str

def spline3(x,y,point,deg):
    tck,u = interpolate.splprep([x,y],k=deg,s=0) 
    u = np.linspace(0,1,num=point,endpoint=True) 
    spline = interpolate.splev(u,tck)
    return spline[0],spline[1]

def cubic_interpolate(data):
    xlist = data["x"]
    ylist = data["y"]
    a3,b3 = spline3(xlist,ylist,300,3)
    a3,b3 = periodic(a3,b3)
    return a3, b3
    '''
    file = open('./test7.txt', 'w')
    maped_list = map(str, a3) 
    a3_str = ','.join(maped_list)
    file.write(a3_str)
    file.close()
    plt.plot(a3,b3,label="splprep")
    plt.title("spline")
    plt.xlim([0, 300])
    plt.ylim([0, 300])
    plt.legend(loc='lower right')
    plt.grid(which='minor',color='black',linestyle='-')
    plt.xticks(list(filter(lambda x: x%1==0, np.arange(0,300))))
    plt.yticks(list(filter(lambda x: x%1==0, np.arange(0,300))))
    plt.show()
    '''
    '''
    x = np.array(xlist)
    y = np.array(ylist)
    f_line = interpolate.interp1d(x,y)
    f_CS = interpolate.interp1d(x,y,kind='cubic')
    interpolate.splrep
    xnew =np.linspace(0, 300, num=300)
    
    plt.plot(x, y, 'o')
    plt.plot(xnew, f_CS(xnew), '-')
    print(f_CS(xnew))

    plt.legend(['Raw data','Lagrange', 'Cubic spline'], loc='best')
    plt.show()
    '''
def periodic(xlist,ylist):
    #xlistに点対称な座標たち
    pivot_xlist = xlist * (-1) + (xlist[0] + xlist[-1])
    #xlistに点対称な座標たち
    pivot_ylist = ylist * (-1) + (ylist[0] + ylist[-1])
    #閉曲線を作り、X,Yの媒介変数表示を周期関数にする
    xlist = np.append(pivot_xlist[1:-1], xlist)
    ylist = np.append(pivot_ylist[1:-1], ylist)
    return xlist, ylist

def fourier(_list,n):
    #フーリエ級数展開した際のcos,sinの係数たち
    a = np.zeros(n+1)
    b = np.zeros(n+1)
    #-πからπまでをn分割した配列
    t = np.linspace((-1) * np.pi, np.pi, _list.size)
    #最後の要素を削除
    t = np.delete(t,-1)
    #区分求積法の1つの区間
    delta_t = 2 * np.pi / _list.size
    for i in range(0, n+1):
        for k in range(0, _list.size - 1):
            a[i] += _list[k] * np.cos(i * t[k]) * delta_t
            b[i] += _list[k] * np.sin(i * t[k]) * delta_t
    a /= np.pi
    b /= np.pi
    '''
    #グラフを表示してくれるよ
    x = np.arange(-2*np.pi, 2*np.pi, 0.05)
    y = np.zeros(len(x))
    for i in range(1,n+1):
        y += a[i] * np.cos(i * x) + b[i] * np.sin(i * x)
    y += a[0]/2
    plt.plot(x, y, label="n = {}".format(n))
    plt.legend(loc="upper left")
    plt.show()
    '''

    return a, b

def main():
    n = 50      #フーリエ級数展開を有限で打ち切るその数
    _json = get_json()
    _dict = json.loads(_json)
    _dict = _dict.replace('\\','')
    x_y_json = json.loads(_dict)
    #3次スプライン曲線で補間した密な点列を得る
    x,y = cubic_interpolate(x_y_json)

    a_x,b_x = fourier(x,n) #x(t)のフーリエ級数展開のsin,cosの係数たちをa_x,b_xに格納
    a_y,b_y = fourier(y,n) #y(t)のフーリエ級数展開のsin,cosの係数たちをa_x,b_xに格納
    x = np.array([a_x,b_x])
    y = np.array([a_y,b_y])

    #フーリエ級数展開の係数を格納して、それを返す
    res_json = {}
    res_json["x"] = [a_x.tolist(), b_x.tolist()]
    res_json["y"] = [a_y.tolist(), b_y.tolist()]

    print(json.dumps(res_json))

if __name__ == '__main__':
    main()