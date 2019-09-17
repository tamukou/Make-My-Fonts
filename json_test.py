import json

write_f = open('ave_x_y.json','r+')
try:
    json_dict = json.load(write_f)
except:
    print('err')
print(json_dict['丁'])