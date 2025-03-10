let labelData = null;
let itemData = null;
let selectedAttributes = [];
let selectedColors = [];
let selectedLocations = [];

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
    const filterLocation = document.getElementById('filterLocation');

    labelData.categories.forEach(category => {
        filterCategory.appendChild(new Option(category, category));
    });
    labelData.colors.forEach(color => {
        filterColor.appendChild(new Option(color, color));
    });
    labelData.locations.forEach(location => {
        filterLocation.appendChild(new Option(location, location));
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

function toggleAttributeSelection(select) {
    const selectedValue = select.value;
    if (selectedValue === '') {
        selectedAttributes = [];
    } else {
        if (selectedAttributes.includes(selectedValue)) {
            selectedAttributes = selectedAttributes.filter(s => s !== selectedValue);
        } else {
            selectedAttributes.push(selectedValue);
        };
    }
    updateAttributeOptions();
}

function toggleColorSelection(select) {
    const selectedValue = select.value;
    if (selectedValue === '') {
        selectedColors = [];
    } else {
        if (selectedColors.includes(selectedValue)) {
            selectedColors = selectedColors.filter(s => s !== selectedValue);
        } else {
            selectedColors.push(selectedValue);
        };
    }
    updateColorOptions();
}

function toggleLocationSelection(select) {
    const selectedValue = select.value;
    if (selectedValue === '') {
        selectedLocations = [];
    } else {
        if (selectedLocations.includes(selectedValue)) {
            selectedLocations = selectedLocations.filter(s => s !== selectedValue);
        } else {
            selectedLocations.push(selectedValue);
        };
    }
    updateLocationOptions();
}

async function showItems(filterCat = '', filterType = '', filterSub = '', filterAttrs = [], filterColors = [], filterLocations = []) {
    if (!itemData) {
        itemData = await fetchData('data/item.json');
        if (!itemData) return;
    }

    const tbody = document.getElementById('itemList');
    tbody.innerHTML = '';
    itemData.forEach((item, index) => {
        const catMatch = filterCat === '' || item.category.includes(filterCat);
        const typeMatch = filterType === '' || item.type.includes(filterType);
        const subMatch = filterSub === '' || item.subType.includes(filterSub);
        // 属性筛选：单选包含，多选与
        const attrMatch = filterAttrs.length === 0 || 
                          (filterAttrs.length === 1 ? item.attribute.some(attr => attr.includes(filterAttrs[0])) : 
                          filterAttrs.every(attr => item.attribute.some(itemAttr => itemAttr.includes(attr))));
        // 颜色筛选：单选包含，多选与
        const colorMatch = filterColors.length === 0 || 
                          (filterColors.length === 1 ? item.color.includes(filterColors[0]) : 
                          filterColors.every(color => item.color.includes(color)));
        // 位置筛选：单选包含，多选与
        const locationMatch = filterLocations.length === 0 || 
                             (filterLocations.length === 1 ? item.location.includes(filterLocations[0]) : 
                             filterLocations.every(loc => item.location.includes(loc)));

        if (catMatch && typeMatch && subMatch && attrMatch && colorMatch && locationMatch) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><img src="${item.image}" alt="图片" onerror="this.src='https://via.placeholder.com/120'" onclick="openModal('${item.image}')"></td>
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

function openModal(imageSrc) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    modal.style.display = 'block';
    modalImg.src = imageSrc;
}

function closeModal() {
    const modal = document.getElementById('imageModal');
    modal.style.display = 'none';
}

document.querySelector('.close').addEventListener('click', closeModal);
window.addEventListener('click', function(event) {
    const modal = document.getElementById('imageModal');
    if (event.target === modal) {
        closeModal();
    }
});

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
        filterLocations: selectedLocations
    });

    await showItems(filterCat, filterType, filterSub, selectedAttributes, selectedColors, selectedLocations);
}

function resetFilters() {
    const filterCategory = document.getElementById('filterCategory');
    const filterType = document.getElementById('filterType');
    const filterSubType = document.getElementById('filterSubType');
    const filterAttribute = document.getElementById('filterAttribute');
    const filterColor = document.getElementById('filterColor');
    const filterLocation = document.getElementById('filterLocation');

    filterCategory.value = '';
    filterType.innerHTML = '<option value="">选择类型</option>';
    filterSubType.innerHTML = '<option value="">选择子类型</option>';
    filterAttribute.innerHTML = '<option value="">选择属性</option>';
    selectedAttributes = [];
    filterColor.innerHTML = '<option value="">选择颜色</option>';
    selectedColors = [];
    filterLocation.innerHTML = '<option value="">选择位置</option>';
    selectedLocations = [];

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

async function init() {
    await populateFilters();
    await showItems();
}
init();