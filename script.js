// Flute 类型参数配置
const FLUTE_PARAMS = {
    BAF: { layers: 14, pcsPerBundle: 10 },
    AF: { layers: 20, pcsPerBundle: 10 },
    BF: { layers: 16, pcsPerBundle: 20 }
};

// Pallet 尺寸标准
const PALLET_DIMENSIONS = {
    width: 1300,   // 托盘宽度
    length: 1250   // 托盘长度
};

// 全局变量存储所有计算结果
let allLayoutResults = [];

function calculate() {
    // 获取用户输入
    const length = parseFloat(document.getElementById('length').value);
    const width = parseFloat(document.getElementById('width').value);
    const height = parseFloat(document.getElementById('height').value);
    const fluteType = document.getElementById('flute').value;

    // 验证输入
    if (!validateInput(length, width, height)) {
        showError('请输入有效的尺寸 (1-999mm)');
        return;
    }

    // 隐藏错误信息
    hideError();

    // 计算所有可能的摆放方案
    allLayoutResults = calculateAllLayouts(length, width, height);
    
    // 选择最优方案（最多数量）
    const bestResult = selectBestLayout(allLayoutResults);
    
    // 计算最终结果
    const flute = FLUTE_PARAMS[fluteType];
    const totalPcs = bestResult.bundles * flute.pcsPerBundle * flute.layers;
    const pcsPerBundle = flute.pcsPerBundle * flute.layers;

    // 显示结果
    displayResults(bestResult, totalPcs, pcsPerBundle);
    
    // 显示所有方案的比较
    displayLayoutComparison(allLayoutResults, bestResult);
}

// 计算所有可能的摆放方案
function calculateAllLayouts(length, width, height) {
    const results = [];
    const dimensions = [length, width, height];
    const dimNames = ['Length', 'Width', 'Height'];
    
    // 生成所有可能的方向组合
    const combinations = [
        // 原始方向组合
        { aCombo: [0, 1], bCombo: [1, 2], name: "L+W along length, W+H along width" },
        { aCombo: [0, 1], bCombo: [0, 2], name: "L+W along width, L+H along length" },
        { aCombo: [0, 2], bCombo: [1, 2], name: "L+H along length, W+H along width" },
        { aCombo: [0, 2], bCombo: [0, 1], name: "L+H along width, L+W along length" },
        
        // 增加更多方向组合
        { aCombo: [1, 0], bCombo: [0, 2], name: "W+L along length, L+H along width" },
        { aCombo: [1, 2], bCombo: [0, 1], name: "W+H along length, L+W along width" },
        { aCombo: [2, 0], bCombo: [1, 2], name: "H+L along length, W+H along width" },
        { aCombo: [2, 1], bCombo: [0, 2], name: "H+W along length, L+H along width" }
    ];

    combinations.forEach((combo, index) => {
        // 计算A和B的尺寸
        const aDim = dimensions[combo.aCombo[0]] + dimensions[combo.aCombo[1]];
        const bDim = dimensions[combo.bCombo[0]] + dimensions[combo.bCombo[1]];
        
        // 计算在两个方向上的数量
        const c = Math.floor(PALLET_DIMENSIONS.length / aDim);
        const d = Math.floor(PALLET_DIMENSIONS.width / bDim);
        
        // 确保至少为1
        const cCount = Math.max(1, c);
        const dCount = Math.max(1, d);
        
        // 生成描述文本
        const aDesc = `${dimNames[combo.aCombo[0]]}+${dimNames[combo.aCombo[1]]}`;
        const bDesc = `${dimNames[combo.bCombo[0]]}+${dimNames[combo.bCombo[1]]}`;
        
        results.push({
            id: index + 1,
            name: `方案 ${index + 1}`,
            a: aDim,
            b: bDim,
            c: cCount,
            d: dCount,
            bundles: cCount * dCount,
            description: `${aDesc} (${aDim}mm) 沿托盘长度，${bDesc} (${bDim}mm) 沿托盘宽度`,
            efficiency: calculateEfficiency(aDim, bDim, cCount, dCount),
            directionA: combo.aCombo.map(i => dimNames[i]),
            directionB: combo.bCombo.map(i => dimNames[i])
        });
    });

    return results;
}

// 计算空间利用率
function calculateEfficiency(aDim, bDim, cCount, dCount) {
    const totalArea = PALLET_DIMENSIONS.length * PALLET_DIMENSIONS.width;
    const usedArea = aDim * bDim * cCount * dCount;
    return Math.round((usedArea / totalArea) * 100);
}

// 选择最优的摆放方案
function selectBestLayout(results) {
    // 按bundles数量降序排序，如果数量相同则按空间利用率排序
    results.sort((a, b) => {
        if (b.bundles !== a.bundles) {
            return b.bundles - a.bundles;
        }
        return b.efficiency - a.efficiency;
    });
    return results[0];
}

// 显示所有方案的比较
function displayLayoutComparison(results, bestResult) {
    const comparisonDiv = document.getElementById('layout-comparison');
    if (!comparisonDiv) return;
    
    // 清空之前的内容
    comparisonDiv.innerHTML = '<h3>所有摆放方案比较:</h3>';
    
    // 创建表格
    const table = document.createElement('table');
    table.className = 'comparison-table';
    
    // 表头
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>方案</th>
            <th>捆数</th>
            <th>A尺寸</th>
            <th>B尺寸</th>
            <th>每方向数量</th>
            <th>空间利用率</th>
            <th>描述</th>
        </tr>
    `;
    table.appendChild(thead);
    
    // 表格主体
    const tbody = document.createElement('tbody');
    
    results.forEach((result) => {
        const isBest = result.id === bestResult.id;
        const row = document.createElement('tr');
        row.className = isBest ? 'best-row' : '';
        
        row.innerHTML = `
            <td>${isBest ? '⭐ ' : ''}${result.name}</td>
            <td><strong>${result.bundles}</strong></td>
            <td>${result.a}mm</td>
            <td>${result.b}mm</td>
            <td>${result.c}×${result.d}</td>
            <td>${result.efficiency}%</td>
            <td>${result.description}</td>
        `;
        
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    comparisonDiv.appendChild(table);
    
    // 添加托盘尺寸信息
    const palletInfo = document.createElement('div');
    palletInfo.className = 'pallet-info';
    palletInfo.innerHTML = `
        <p><small>托盘尺寸: ${PALLET_DIMENSIONS.length}mm × ${PALLET_DIMENSIONS.width}mm</small></p>
    `;
    comparisonDiv.appendChild(palletInfo);
}

function validateInput(length, width, height) {
    return !isNaN(length) && !isNaN(width) && !isNaN(height) &&
           length > 0 && width > 0 && height > 0 &&
           length <= 999 && width <= 999 && height <= 999;
}

function displayResults(bestResult, totalPcs, pcsPerBundle) {
    // 显示中间参数
    document.getElementById('param-a').textContent = `${bestResult.a} mm`;
    document.getElementById('param-b').textContent = `${bestResult.b} mm`;
    document.getElementById('param-c').textContent = `${bestResult.c}`;
    document.getElementById('param-d').textContent = `${bestResult.d}`;
    
    // 显示最优方案描述
    const layoutInfo = document.getElementById('layout-info');
    if (!layoutInfo) {
        // 如果还没有这个元素，创建一个
        const resultDiv = document.querySelector('.results');
        const info = document.createElement('div');
        info.id = 'layout-info';
        info.className = 'layout-info';
        resultDiv.insertBefore(info, resultDiv.firstChild);
    }
    
    document.getElementById('layout-info').innerHTML = `
        <h3>最优摆放方案:</h3>
        <div class="best-layout-details">
            <p><strong>${bestResult.name}:</strong> ${bestResult.bundles} 捆</p>
            <p>${bestResult.description}</p>
            <p>方向A: ${bestResult.directionA.join('+')}, 方向B: ${bestResult.directionB.join('+')}</p>
            <p>空间利用率: ${bestResult.efficiency}%</p>
        </div>
    `;
    
    // 显示最终结果
    document.getElementById('result-bundles').textContent = `${bestResult.bundles} 捆`;
    document.getElementById('result-total').textContent = `${totalPcs.toLocaleString()} 片`;
    
    // 显示每捆数量
    const bundleInfo = document.getElementById('bundle-info');
    if (bundleInfo) {
        bundleInfo.textContent = `每捆: ${pcsPerBundle} 片`;
    }
    
    // 更新页面标题显示托盘使用优化
    updatePageTitle(bestResult);
}

// 更新页面标题显示优化信息
function updatePageTitle(bestResult) {
    const originalLayouts = allLayoutResults.filter(r => r.id <= 4);
    const originalBest = selectBestLayout(originalLayouts);
    
    if (bestResult.bundles > originalBest.bundles) {
        const improvement = Math.round(((bestResult.bundles - originalBest.bundles) / originalBest.bundles) * 100);
        document.title = `托盘计算器 - 优化 ${improvement}%`;
    } else {
        document.title = '托盘计算器';
    }
}

// 错误处理函数
function showError(message) {
    let errorDiv = document.getElementById('error-message');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'error-message';
        errorDiv.className = 'error-message';
        const container = document.querySelector('.container');
        container.insertBefore(errorDiv, container.firstChild);
    }
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function hideError() {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}

// 重置表单
function resetForm() {
    document.getElementById('length').value = '';
    document.getElementById('width').value = '';
    document.getElementById('height').value = '';
    document.getElementById('flute').value = 'BAF';
    
    // 清空结果显示
    document.getElementById('param-a').textContent = '0 mm';
    document.getElementById('param-b').textContent = '0 mm';
    document.getElementById('param-c').textContent = '0';
    document.getElementById('param-d').textContent = '0';
    document.getElementById('result-bundles').textContent = '0 捆';
    document.getElementById('result-total').textContent = '0 片';
    
    const layoutInfo = document.getElementById('layout-info');
    if (layoutInfo) {
        layoutInfo.innerHTML = '';
    }
    
    const comparisonDiv = document.getElementById('layout-comparison');
    if (comparisonDiv) {
        comparisonDiv.innerHTML = '';
    }
    
    hideError();
    document.title = '托盘计算器';
}

// 导出结果
function exportResults() {
    const length = document.getElementById('length').value;
    const width = document.getElementById('width').value;
    const height = document.getElementById('height').value;
    const fluteType = document.getElementById('flute').value;
    
    if (!validateInput(parseFloat(length), parseFloat(width), parseFloat(height))) {
        showError('无法导出：请输入有效数据');
        return;
    }
    
    const bestResult = allLayoutResults[0];
    const flute = FLUTE_PARAMS[fluteType];
    const totalPcs = bestResult.bundles * flute.pcsPerBundle * flute.layers;
    
    const data = {
        timestamp: new Date().toLocaleString(),
        input: {
            length: `${length}mm`,
            width: `${width}mm`,
            height: `${height}mm`,
            fluteType: fluteType
        },
        palletDimensions: {
            length: `${PALLET_DIMENSIONS.length}mm`,
            width: `${PALLET_DIMENSIONS.width}mm`
        },
        bestLayout: bestResult,
        results: {
            bundles: bestResult.bundles,
            totalPieces: totalPcs,
            piecesPerBundle: flute.pcsPerBundle * flute.layers
        }
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `pallet-calculation-${new Date().toISOString().slice(0,10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// 页面加载时自动计算一次
document.addEventListener('DOMContentLoaded', function() {
    // 设置默认值
    document.getElementById('length').value = '400';
    document.getElementById('width').value = '300';
    document.getElementById('height').value = '200';
    
    // 初始化计算
    calculate();
    
    // 为输入框添加实时计算
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('input', calculate);
    });
    
    // 添加重置按钮事件
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetForm);
    }
    
    // 添加导出按钮事件
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportResults);
    }
});

// 添加键盘快捷键支持
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        resetForm();
    }
    if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        exportResults();
    }
    if (e.key === 'Escape') {
        resetForm();
    }
});
