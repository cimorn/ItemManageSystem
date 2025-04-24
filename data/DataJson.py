import json
from collections import defaultdict  # 用于创建默认值为列表的字典
import os  # 用于文件路径操作

def process_text_file(file_path):
    """
    处理文本文件并解析为结构化数据
    :param file_path: 输入文本文件路径
    :return: 解析后的物品数据和标签数据
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        # 读取文件内容并按行分割，去除首尾空白
        lines = f.read().strip().split('\n')
    
    # 提取表头（第一行），按制表符分割
    headers = lines[0].split('\t')
    # 提取数据行（从第二行开始），按制表符分割每个字段
    data_rows = [line.split('\t') for line in lines[1:]]

    item_data = []  # 存储物品数据的列表
    for row in data_rows:
        # 通过表头索引获取对应字段值，处理不同数据类型
        image = row[headers.index('image')]  # 图片路径
        # 处理可选字段（若表头中存在'name'字段则获取，否则为空字符串）
        name = row[headers.index('name')] if 'name' in headers else ''
        category = row[headers.index('category')]  # 类别
        type_val = row[headers.index('type')]  # 类型
        subType = row[headers.index('subType')]  # 子类型
        
        # 处理属性字段：按逗号分割为列表，空值则转为空列表
        attribute = row[headers.index('attribute')].split(',') if row[headers.index('attribute')] else []
        spec = row[headers.index('spec')]  # 规格
        quantity = int(row[headers.index('quantity')])  # 数量（转为整数）
        
        # 处理颜色字段：若包含逗号则分割为列表，否则作为单个元素列表
        color_field = row[headers.index('color')]
        color = color_field.split(',') if ',' in color_field else [color_field]
        
        # 处理存放位置字段：按逗号分割，去除空白后去重排序
        loncation_field = row[headers.index('location')]
        locations = [loc.strip() for loc in loncation_field.split(',') if loc.strip()]  # 去除空白并过滤空字符串
        location_str = sorted(set(locations))  # 去重并排序
        
        # 组装单个物品数据字典
        item_data.append({
            "name": name,
            "image": image,
            "category": category,
            "type": type_val,
            "subType": subType,
            "attribute": attribute,
            "spec": spec,
            "color": color,
            "quantity": quantity,
            "location": location_str
        })

    # 初始化标签数据字典，用于存储分类信息
    label_data = {
        "categories": sorted(set([row[headers.index('category')] for row in data_rows])),  # 所有类别去重排序
        "colors": sorted(set([col for item in item_data for col in item["color"]])),  # 所有颜色去重排序
        "locations": sorted(set([loc for item in item_data for loc in item["location"]])),  # 所有位置去重排序
        "typeMap": defaultdict(list),  # 类别-类型映射（默认值为列表）
        "subTypeMap": defaultdict(list),  # 类型-子类型映射
        "attributeMap": defaultdict(list)  # 子类型-属性映射
    }

    # 构建类型映射：category -> 该类别下的所有type去重
    for row in data_rows:
        cat = row[headers.index('category')]
        typ = row[headers.index('type')]
        label_data["typeMap"][cat].append(typ)
    for k, v in label_data["typeMap"].items():
        label_data["typeMap"][k] = sorted(set(v))  # 去重并排序

    # 构建子类型映射：type -> 该类型下的所有subType去重
    for row in data_rows:
        typ = row[headers.index('type')]
        sub = row[headers.index('subType')]
        label_data["subTypeMap"][typ].append(sub)
    for k, v in label_data["subTypeMap"].items():
        label_data["subTypeMap"][k] = sorted(set(v))  # 去重并排序

    # 构建属性映射：subType -> 该子类型下的所有attribute去重
    for row in data_rows:
        sub = row[headers.index('subType')]
        attrs = row[headers.index('attribute')].split(',') if row[headers.index('attribute')] else []
        label_data["attributeMap"][sub].extend(attrs)
    for k, v in label_data["attributeMap"].items():
        label_data["attributeMap"][k] = sorted(set(v))  # 去重并排序
    return item_data, label_data



# 定义转item.json文件
def ToItemJson(item_data,item_output):
        # 将列表转换为字符串
    data_str = json.dumps(item_data, ensure_ascii=False)

    # 定义替换规则
    replace_rules = [
        ('{', '\n\t{\t\n'),
        ('"name"', '\t\t"name"'),
        ('"image"', '\n\t\t"image"'),
        ('"category"', '\n\t\t"category"'),
        ('"type"', '\n\t\t"type"'),
        ('"subType"', '\n\t\t"subType"'),
        ('"attribute"', '\n\t\t"attribute"'),
        ('"spec"', '\n\t\t"spec"'),
        ('"color"', '\n\t\t "color"'),
        ('"quantity"', '\n\t\t"quantity"'),
        ('"location"', '\n\t\t"location"'),
        (']},', ']\n\t},'),
        ('}]', '\n\t}\n]')
    ]
    # 应用替换规则
    processed_data = data_str
    for old, new in replace_rules:
        processed_data = processed_data.replace(old, new)
    # 写入 txt 文件
    with open(item_output, 'w', encoding='utf-8') as f:
        f.write(processed_data)
    print("item.json is ok")

# 定义转item.json文件
def ToLabelJson(label_data,label_output):
        # 将列表转换为字符串
    data_str = json.dumps(label_data, ensure_ascii=False)

    # 定义替换规则
    replace_rules = [
        ('"subTypeMap"', '\n\t"subTypeMap"'),
        ('"attributeMap"', '\n\t"attributeMap"'),    
        ('], ', '],\n\t\t'),
        (': {', ': {\n\t\t'),
        ('},', '\n\t},'),
        ('}}', '\n\t}\n}'),
        ('{"','{\n\t"'),
        ('\t"colors"','"colors"'),
        ('\t"locations"','"locations"'),
        ('\t"typeMap": {','"typeMap": {')
    ]
    # 应用替换规则
    processed_data = data_str
    for old, new in replace_rules:
        processed_data = processed_data.replace(old, new)
    # 写入 txt 文件
    with open(label_output, 'w', encoding='utf-8') as f:
        f.write(processed_data)
    print("label.json is ok")


 
if __name__ == "__main__":
    # 获取当前脚本所在目录
    script_dir = os.path.dirname(os.path.abspath(__file__))
    # 拼接输入文件路径（假设data.txt与脚本同目录）
    input_file = os.path.join(script_dir, "data.txt")
    # 输出文件路径（默认与脚本同目录）
    item_output = os.path.join(script_dir, "item.json")
    label_output = os.path.join(script_dir, "label.json")

    # 处理文件并生成数据
    item_data, label_data = process_text_file(input_file)

    # 保存为JSON文件
    ToItemJson(item_data,item_output)
    ToLabelJson(label_data,label_output)