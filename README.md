### 项目概述与特点

物品管理系统是一个基于 Web的应用程序，用户可以管理和筛选存储在 JSON 文件中的物品数据。该系统支持多级筛选功能（类别、类型、子类型、属性和颜色），并提供直观的表格展示，支持多重属性筛选和移动端优化。

* 多级筛选：支持通过类别、类型、子类型、属性和颜色逐步筛选物品。
* 多重属性支持：属性支持多选，使用“与”逻辑进行筛选，结果更精准。
* 响应式设计：页面适配桌面和移动设备，提供良好的用户体验。
* 数据驱动：所有数据存储于 JSON 文件，便于维护和扩展。
* 图片展示：支持展示物品图片，图片链接可自定义。


---


### 项目目录结构

```text
ItemManage/
├── public/
│   ├── styles.css    # CSS 样式文件
│   └── script.js     # JavaScript 逻辑文件
├── data/
│   ├── item.json     # 物品数据文件
│   └── label.json    # 分类数据文件
├── index.html        # 主页面
└── open.js           # 服务器代码
```


---


### 网页预览

|                            电脑端                            |             移动端             |
| :----------------------------------------------------------: | :----------------------------: |
| <img src="./images/desktop.png" alt="desktop" style="zoom: 67%;" /> | ![mobile](./images/mobile.png) |



---


### 运行

#### 使用 Node.js

> 1. 下载并安装 Node.js
> 
> 2. 安装 http-server 
> 
> - 终端输入`npm install -g http-server`
> 
> - 或者终端直接输入`node open.js`(服务器代码已经提供)
> 
> 3. 打开浏览器，输入`http://localhost:8080`，即可看到页面



#### 使用 VS Code 的 Live Server 扩展

> 1. 安装 VS Code
> 
> - 下载地址：code.visualstudio.com
> 
> 2. 安装 Live Server 扩展
> 
> - 打开 VS Code，点击左侧“扩展”图标（或按 Ctrl+Shift+X）
> 
> - 搜索 “Live Server”，安装由 Ritwick Dey 开发的扩展
> 
> 3. 运行服务器
>  
>  打开index.html 文件
> 
> - 右键点击文件内容，选择 “Open with Live Server”
> 
> - 浏览器会自动打开，通常是 http://127.0.0.1:5500


---


### 添加自定义数据
可以通过编辑 `data/label.json` 和 `data/item.json` 文件来添加想要的数据。以下是具体步骤：

1. 编辑 `label.json`
   - **添加新类别**：在 `categories` 数组中添加新类别名称。
   - **添加类型**：在 `typeMap` 中为新类别添加对应的类型。
   - **添加子类型**：在 `subTypeMap` 中为新类型添加子类型。
   - **添加属性**：在 `attributeMap` 中为新子类型添加可选属性。
   - **更新颜色**（可选）：在 `colors` 数组中添加新颜色。

2. 编辑 `item.json`
   - 添加新物品条目，确保每个字段与 `label.json` 中的定义匹配。
   - 字段包括：`image`、`category`、`type`、`subType`、`color`、`attribute`（数组）、`quantity`、`spec` 和 `location`。

3. 保存并重启服务器
   - 保存文件后，重新运行 `node open.js` 或刷新 Live Server 页面以加载新数据。


#### 示例
假设您想添加一个新类别“食品”，包含类型“饮料”和子类型“果汁”，并添加相关物品：

##### 修改 `label.json`
```diff
{
  "categories": [
    ........
    "体育", 
+    "食品"
    ],
  "colors": ["红色", "蓝色", "黑色", "银色", "金色", "白色", "灰色", "深蓝", "浅蓝", "卡其色", "紫色", "绿色", "黄色", "军绿色", "粉色", "无色", "橙色"],
  "typeMap": {
    ........
    "体育": ["球类", "健身", "户外"],
+   "食品": ["饮料"]
  },
  "subTypeMap": {
    ........
    "户外": ["登山杖"],
+    "饮料": ["果汁"]
  },
  "attributeMap": {
    ........
    "登山杖": ["轻便", "可折叠"],
+    "果汁": ["纯果汁", "无糖"]
  }
}
```

##### 修改 `item.json`
在现有数据末尾添加：
```json
[
  {
    "image": "http://gips0.baidu.com/it/u=3602773692,1512483864&fm=3028&app=3028&f=JPEG&fmt=auto?w=960&h=1280",
    "category": "食品",
    "type": "饮料",
    "subType": "果汁",
    "color": "橙色",
    "attribute": ["纯果汁", "无糖"],
    "quantity": 30,
    "spec": "1L",
    "location": "仓库CC"
  }
]
```

##### 注意事项
- **字段一致性**：确保 `item.json` 中的 `category`、`type`、`subType`、`color` 和 `attribute` 值在 `label.json` 中有对应定义。
- **JSON 格式**：编辑时保持正确的 JSON 格式，避免语法错误（如多余逗号）。
- **图片链接**：使用有效的图片 URL，若链接失效，可替换为本地图片路径或占位图。


---


### 未来想完成的功能

- [ ] 建立前端增删改数据
- [ ] 建立登陆界面
- [ ] 增删改数据和项目管理一体化


### 源码
GitHub：[ItemManageSystem](https://github.com/cimorn/ItemManageSystem)


