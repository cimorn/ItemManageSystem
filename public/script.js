// 全局变量定义，用于存储数据和状态
let labelData = null; // 存储从 label.json 加载的标签数据（如类别、类型映射等）
let itemData = null; // 存储从 item.json 加载的物品数据
let selectedAttributes = []; // 存储用户多选的属性值
let selectedColors = []; // 存储用户多选的颜色值
let selectedLocations = []; // 存储用户多选的位置值
let selectedSpecs = []; // 存储用户多选的规格值
let userCredentials = null; // 存储从 password.json 加载的用户凭据

// 异步获取 JSON 文件数据的通用函数
async function fetchData(url) {
    try {
        const response = await fetch(url + '?t=' + new Date().getTime());
        if (!response.ok) {
            throw new Error(`请求 ${url} 失败，状态码: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`加载 ${url} 时出错:`, error);
        alert(`无法加载 ${url}，请检查文件是否存在或路径是否正确`);
        return null;
    }
}

// 加载用户凭据数据（password.json）
async function loadCredentials() {
    userCredentials = await fetchData('data/password.json');
    if (!userCredentials) {
        document.getElementById('loginError').textContent = '无法加载用户凭据，请联系管理员！';
    }
}

// 验证用户输入的用户名和密码
function validateLogin(username, password) {
    if (!userCredentials || !userCredentials.users) return false;
    return userCredentials.users.some(user => 
        user.username === username && user.password === password
    );
}

// 处理登录表单的提交事件
document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorMessage = document.getElementById('loginError');

    if (!userCredentials) {
        await loadCredentials();
    }

    if (validateLogin(username, password)) {
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('mainContainer').style.display = 'block';
        init();
    } else {
        errorMessage.textContent = '用户名或密码错误，请重试！';
    }
});

// 初始化筛选框选项，从 label.json 加载数据
async function populateFilters() {
    labelData = await fetchData('data/label.json');
    if (!labelData) return;

    const filterCategory = document.getElementById('filterCategory');
    const filterColor = document.getElementById('filterColor');
    const filterLocation = document.getElementById('filterLocation');

    filterCategory.innerHTML = '<option value="">选择类别</option>'; // 确保默认空
    labelData.categories.forEach(category => {
        filterCategory.appendChild(new Option(category, category));
    });
    filterColor.innerHTML = '<option value="">选择颜色</option>';
    labelData.colors.forEach(color => {
        filterColor.appendChild(new Option(color, color));
    });
    filterLocation.innerHTML = '<option value="">选择位置</option>';
    labelData.locations.forEach(location => {
        filterLocation.appendChild(new Option(location, location));
    });

    updateTypeOptions(); // 初始化类型选项
}

// 更新类型下拉框选项，根据所选类别动态生成
function updateTypeOptions() {
    const filterCategory = document.getElementById('filterCategory').value;
    const filterType = document.getElementById('filterType');
    filterType.innerHTML = '<option value="">选择类型</option>';

    if (labelData && filterCategory) {
        const types = labelData.typeMap[filterCategory] || [];
        types.forEach(type => {
            filterType.appendChild(new Option(type, type));
        });
    }
    updateSubTypeOptions();
}

// 更新子类型下拉框选项，根据所选类型动态生成
function updateSubTypeOptions() {
    const filterType = document.getElementById('filterType').value;
    const filterSubType = document.getElementById('filterSubType');
    filterSubType.innerHTML = '<option value="">选择子类型</option>';

    if (labelData && filterType) {
        const subTypes = labelData.subTypeMap[filterType] || [];
        subTypes.forEach(subType => {
            filterSubType.appendChild(new Option(subType, subType));
        });
    }
    updateAttributeOptions();
}

// 更新属性下拉框选项，根据所选子类型动态生成，支持多选显示
function updateAttributeOptions() {
    const filterSubType = document.getElementById('filterSubType').value;
    const filterAttribute = document.getElementById('filterAttribute');
    filterAttribute.innerHTML = '';

    const displayText = selectedAttributes.length > 0 ? selectedAttributes.join(', ') : '选择属性';
    filterAttribute.appendChild(new Option(displayText, ''));

    if (labelData && filterSubType) {
        const attributes = labelData.attributeMap[filterSubType] || [];
        attributes.forEach(attribute => {
            const optionText = selectedAttributes.includes(attribute) ? `[✅] ${attribute}` : attribute;
            filterAttribute.appendChild(new Option(optionText, attribute));
        });
    }
    updateSpecOptions();
    filterItems();
}

// 更新颜色下拉框选项，支持多选显示
function updateColorOptions() {
    const filterColor = document.getElementById('filterColor');
    filterColor.innerHTML = '';

    const displayText = selectedColors.length > 0 ? selectedColors.join(', ') : '选择颜色';
    filterColor.appendChild(new Option(displayText, ''));

    if (labelData && labelData.colors) {
        labelData.colors.forEach(color => {
            const optionText = selectedColors.includes(color) ? `[✅] ${color}` : color;
            filterColor.appendChild(new Option(optionText, color));
        });
    }
    filterItems();
}

// 更新位置下拉框选项，支持多选显示
function updateLocationOptions() {
    const filterLocation = document.getElementById('filterLocation');
    filterLocation.innerHTML = '';

    const displayText = selectedLocations.length > 0 ? selectedLocations.join(', ') : '选择位置';
    filterLocation.appendChild(new Option(displayText, ''));

    if (labelData && labelData.locations) {
        labelData.locations.forEach(location => {
            const optionText = selectedLocations.includes(location) ? `[✅] ${location}` : location;
            filterLocation.appendChild(new Option(optionText, location));
        });
    }
    filterItems();
}

// 更新规格下拉框选项，根据所选子类型动态生成，支持多选显示
function updateSpecOptions() {
    const filterSubType = document.getElementById('filterSubType').value;
    const filterSpec = document.getElementById('filterSpec');
    filterSpec.innerHTML = '';

    const displayText = selectedSpecs.length > 0 ? selectedSpecs.join(', ') : '选择规格';
    filterSpec.appendChild(new Option(displayText, ''));

    if (itemData && filterSubType) {
        const specs = [...new Set(itemData
            .filter(item => item.subType === filterSubType)
            .map(item => item.spec)
            .filter(spec => spec !== ''))];
        specs.forEach(spec => {
            const optionText = selectedSpecs.includes(spec) ? `[✅] ${spec}` : spec;
            filterSpec.appendChild(new Option(optionText, spec));
        });
    }
    filterItems();
}

// 处理属性多选逻辑
function toggleAttributeSelection(select) {
    const selectedValue = select.value;
    if (selectedValue === '') {
        selectedAttributes = [];
    } else {
        if (selectedAttributes.includes(selectedValue)) {
            selectedAttributes = selectedAttributes.filter(s => s !== selectedValue);
        } else {
            selectedAttributes.push(selectedValue);
        }
    }
    updateAttributeOptions();
}

// 处理颜色多选逻辑
function toggleColorSelection(select) {
    const selectedValue = select.value;
    if (selectedValue === '') {
        selectedColors = [];
    } else {
        if (selectedColors.includes(selectedValue)) {
            selectedColors = selectedColors.filter(s => s !== selectedValue);
        } else {
            selectedColors.push(selectedValue);
        }
    }
    updateColorOptions();
}

// 处理位置多选逻辑
function toggleLocationSelection(select) {
    const selectedValue = select.value;
    if (selectedValue === '') {
        selectedLocations = [];
    } else {
        if (selectedLocations.includes(selectedValue)) {
            selectedLocations = selectedLocations.filter(s => s !== selectedValue);
        } else {
            selectedLocations.push(selectedValue);
        }
    }
    updateLocationOptions();
}

// 处理规格多选逻辑
function toggleSpecSelection(select) {
    const selectedValue = select.value;
    if (selectedValue === '') {
        selectedSpecs = [];
    } else {
        if (selectedSpecs.includes(selectedValue)) {
            selectedSpecs = selectedSpecs.filter(s => s !== selectedValue);
        } else {
            selectedSpecs.push(selectedValue);
        }
    }
    updateSpecOptions();
}

// 根据筛选条件显示物品列表
async function showItems(filterCat = '', filterType = '', filterSub = '', filterAttrs = [], filterColors = [], filterLocations = [], filterSpecs = []) {
    if (!itemData) {
        itemData = await fetchData('data/item.json');
        if (!itemData) return;
    }

    console.log('加载的物品数量:', itemData.length); // 调试：确认加载的数据条数
    const tbody = document.getElementById('itemList');
    tbody.innerHTML = '';

    itemData.forEach((item, index) => {
        const catMatch = filterCat === '' || item.category.includes(filterCat);
        const typeMatch = filterType === '' || item.type.includes(filterType);
        const subMatch = filterSub === '' || item.subType.includes(filterSub);
        const attrMatch = filterAttrs.length === 0 || 
                          (filterAttrs.length === 1 ? item.attribute.some(attr => attr.includes(filterAttrs[0])) : 
                          filterAttrs.every(attr => item.attribute.some(itemAttr => itemAttr.includes(attr))));
        const colorMatch = filterColors.length === 0 || 
                          (filterColors.length === 1 ? item.color.includes(filterColors[0]) : 
                          filterColors.every(color => item.color.includes(color)));
        // 修改 locationMatch 以兼容字符串和数组
        const locationMatch = filterLocations.length === 0 || 
                             (filterLocations.length === 1 ? 
                                (Array.isArray(item.location) ? item.location.some(loc => loc.includes(filterLocations[0])) : item.location.includes(filterLocations[0])) : 
                                filterLocations.every(filterLoc => 
                                    Array.isArray(item.location) ? item.location.some(loc => loc.includes(filterLoc)) : item.location.includes(filterLoc)));
        const specMatch = filterSpecs.length === 0 || 
                          (filterSpecs.length === 1 ? item.spec.includes(filterSpecs[0]) : 
                          filterSpecs.every(spec => item.spec.includes(spec)));

        if (catMatch && typeMatch && subMatch && attrMatch && colorMatch && locationMatch && specMatch) {
            const row = document.createElement('tr');
            // 修改 location 显示，兼容数组和字符串
            const locationDisplay = Array.isArray(item.location) ? item.location.join(', ') : item.location || '未知';
            console.log(`条目 ${index} - location 类型: ${Array.isArray(item.location) ? '数组' : typeof item.location}, 值: ${locationDisplay}`); // 调试
            row.innerHTML = `
                <td><img src="${item.image}" alt="图片" onerror="this.src='https://via.placeholder.com/120'" onclick="openModal('${item.image}')"></td>
                <td>${item.category}</td>
                <td>${item.type}</td>
                <td>${item.subType}</td>
                <td>${item.color}</td>
                <td>${item.attribute.join(', ')}</td>
                <td>${item.spec}</td>
                <td>${item.quantity}</td>
                <td>${locationDisplay}</td>
            `;
            tbody.appendChild(row);
        }
    });
}

// 打开图片预览模态框
function openModal(imageSrc) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    modal.style.display = 'block';
    modalImg.src = imageSrc;
}

// 关闭模态框
function closeModal() {
    const modal = document.getElementById('imageModal');
    modal.style.display = 'none';
}

// 绑定关闭按钮点击事件
document.querySelector('.close').addEventListener('click', closeModal);

// 点击模态框外部关闭
window.addEventListener('click', function(event) {
    const modal = document.getElementById('imageModal');
    if (event.target === modal) {
        closeModal();
    }
});

// 根据当前筛选条件更新物品列表
async function filterItems() {
    const filterCat = document.getElementById('filterCategory').value;
    const filterType = document.getElementById('filterType').value;
    const filterSub = document.getElementById('filterSubType').value;

    console.log('筛选条件：', {
        filterCat,
        filterType,
        filterSub,
        filterAttrs: selectedAttributes,
        filterColors: selectedColors,
        filterLocations: selectedLocations,
        filterSpecs: selectedSpecs
    });

    await showItems(filterCat, filterType, filterSub, selectedAttributes, selectedColors, selectedLocations, selectedSpecs);
}

// 重置所有筛选条件
function resetFilters() {
    const filterCategory = document.getElementById('filterCategory');
    const filterType = document.getElementById('filterType');
    const filterSubType = document.getElementById('filterSubType');
    const filterAttribute = document.getElementById('filterAttribute');
    const filterColor = document.getElementById('filterColor');
    const filterLocation = document.getElementById('filterLocation');
    const filterSpec = document.getElementById('filterSpec');

    filterCategory.value = '';
    filterType.innerHTML = '<option value="">选择类型</option>';
    filterSubType.innerHTML = '<option value="">选择子类型</option>';
    filterAttribute.innerHTML = '<option value="">选择属性</option>';
    selectedAttributes = [];
    filterColor.innerHTML = '<option value="">选择颜色</option>';
    selectedColors = [];
    filterLocation.innerHTML = '<option value="">选择位置</option>';
    selectedLocations = [];
    filterSpec.innerHTML = '<option value="">选择规格</option>';
    selectedSpecs = [];

    if (labelData) {
        if (labelData.colors) {
            labelData.colors.forEach(color => {
                filterColor.appendChild(new Option(color, color));
            });
        }
        if (labelData.locations) {
            labelData.locations.forEach(location => {
                filterLocation.appendChild(new Option(location, location));
            });
        }
    }

    filterItems();
}

// 初始化主界面
async function init() {
    await populateFilters();
    resetFilters(); // 重置筛选条件，确保初始显示所有
    await showItems(); // 显示初始物品列表
}

// 页面加载时加载用户凭据
loadCredentials();