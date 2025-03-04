let labelData = null;
let itemData = null;
let selectedAttributes = [];

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

async function populateFilters() {
    labelData = await fetchData('data/label.json');
    if (!labelData) return;

    const filterCategory = document.getElementById('filterCategory');
    const filterColor = document.getElementById('filterColor');

    labelData.categories.forEach(category => {
        filterCategory.appendChild(new Option(category, category));
    });
    labelData.colors.forEach(color => {
        filterColor.appendChild(new Option(color, color));
    });

    updateTypeOptions();
}

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
    filterItems();
}

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

async function showItems(filterCat = '', filterType = '', filterSub = '', filterAttr = [], filterColor = '') {
    if (!itemData) {
        itemData = await fetchData('data/item.json');
        if (!itemData) return;
    }

    const tbody = document.getElementById('itemList');
    tbody.innerHTML = '';
    itemData.forEach((item, index) => {
        const attrMatch = filterAttr.length === 0 || filterAttr.every(attr => item.attribute.includes(attr));
        if (
            (!filterCat || item.category === filterCat) &&
            (!filterType || item.type === filterType) &&
            (!filterSub || item.subType === filterSub) &&
            attrMatch &&
            (!filterColor || item.color === filterColor)
        ) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><img src="${item.image}" alt="图片" onerror="this.src='https://via.placeholder.com/120'"></td>
                <td>${item.category}</td>
                <td>${item.type}</td>
                <td>${item.subType}</td>
                <td>${item.color}</td>
                <td>${item.attribute.join(', ')}</td>
                <td>${item.quantity}</td>
                <td>${item.spec}</td>
                <td>${item.location}</td>
            `;
            tbody.appendChild(row);
        }
    });
}

async function filterItems() {
    const filterCat = document.getElementById('filterCategory').value;
    const filterType = document.getElementById('filterType').value;
    const filterSub = document.getElementById('filterSubType').value;
    const filterColor = document.getElementById('filterColor').value;
    await showItems(filterCat, filterType, filterSub, selectedAttributes, filterColor);
}

function resetFilters() {
    const filterCategory = document.getElementById('filterCategory');
    const filterType = document.getElementById('filterType');
    const filterSubType = document.getElementById('filterSubType');
    const filterAttribute = document.getElementById('filterAttribute');
    const filterColor = document.getElementById('filterColor');

    filterCategory.value = '';
    filterType.innerHTML = '<option value="">选择类型</option>';
    filterSubType.innerHTML = '<option value="">选择子类型</option>';
    filterAttribute.innerHTML = '<option value="">选择属性</option>';
    selectedAttributes = [];
    filterColor.value = '';
    filterItems();
}

async function init() {
    await populateFilters();
    await showItems();
}
init();