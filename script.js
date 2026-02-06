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
        alert('请输入有效的尺寸 (1-999mm)');
        return;
    }

    // 计算所有可能的摆放方案（包括横放和竖放）
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

// 计算所有可能的摆放方案（包括横放和竖放）
function calculateAllLayouts(length, width, height) {
    const results = [];
    const dimensions = [length, width, height];
    const dimNames = ['L', 'W', 'H'];
    
    // 定义所有可能的组合：8种不同的摆放方式
    const combinations = [
        // 基础组合
        { aCombo: [0, 1], bCombo: [1, 2], name: "L+W (长边), W+H (短边)" }, // 原方案
        { aCombo: [0, 1], bCombo: [0, 2], name: "L+W (短边), L+H (长边)" }, // 旋转90度
        { aCombo: [0, 2], bCombo: [1, 2], name: "L+H (长边), W+H (短边)" },
        { aCombo: [0, 2], bCombo: [0, 1], name: "L+H (短边), L+W (长边)" },
        
        // 更多的横放竖放组合
        { aCombo: [1, 0], bCombo: [0, 2], name: "W+L (长边), L+H (短边)" },
        { aCombo: [1, 0], bCombo: [1, 2], name: "W+L (短边), W+H (长边)" },
        { aCombo: [1, 2], bCombo: [0, 1], name: "W+H (长边), L+W (短边)" },
        { aCombo: [2, 1], bCombo: [0, 2], name: "H+W (长边), L+H (短边)" }
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
            description: `${aDesc} (${aDim}mm) 沿托盘长度方向，${bDesc} (${bDim}mm) 沿托盘宽度方向`,
            efficiency: calculateEfficiency(aDim, bDim, cCount, dCount),
            directionA: combo.aCombo.map(i => dimNames[i]),
            directionB: combo.bCombo.map(i => dimNames[i]),
            layoutName: combo.name
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
    if (!comparisonDiv) {
        // 如果没有这个元素，就在页面上创建一个
        const resultSection = document.querySelector('.result-section');
        if (resultSection) {
            comparisonDiv = document.createElement('div');
            comparisonDiv.id = 'layout-comparison';
            comparisonDiv.className = 'result-card';
            resultSection.appendChild(comparisonDiv);
        } else {
            return; // 没有找到合适的位置放置
        }
    }
    
    // 清空之前的内容
    comparisonDiv.innerHTML = '<h3>所有摆放方案比较:</h3>';
    
    // 创建表格
    const table = document.createElement('table');
    table.className = 'comparison-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>方案</th>
                <th>捆数</th>
                <th>尺寸A</th>
                <th>尺寸B</th>
                <th>数量</th>
                <th>利用率</th>
            </tr>
        </thead>
        <tbody>
        </tbody>
    `;
    
    const tbody = table.querySelector('tbody');
    
    results.forEach((result) => {
        const isBest = result.id === bestResult.id;
        const row = document.createElement('tr');
        row.className = isBest ? 'best-row' : '';
        
        row.innerHTML = `
            <td>${isBest ? '⭐ ' : ''}方案 ${result.id}</td>
            <td><strong>${result.bundles}</strong></td>
            <td>${result.a}mm</td>
            <td>${result.b}mm</td>
            <td>${result.c}×${result.d}</td>
            <td>${result.efficiency}%</td>
        `;
        
        tbody.appendChild(row);
    });
    
    comparisonDiv.appendChild(table);
    
    // 添加托盘尺寸信息
    const palletInfo = document.createElement('div');
    palletInfo.className = 'pallet-info';
    palletInfo.innerHTML = `
        <p><small>托盘尺寸: ${PALLET_DIMENSIONS.length}mm × ${PALLET_DIMENSIONS.width}mm</small></p>
        <p><small>最优方案: ${bestResult.layoutName}</small></p>
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
    
    // 显示最终结果
    document.getElementById('result-bundles').textContent = `${bestResult.bundles} 捆`;
    document.getElementById('result-total').textContent = `${totalPcs.toLocaleString()} 片`;
    
    // 显示托盘数量计算
    displayPalletCountInfo(totalPcs, bestResult.bundles, pcsPerBundle);
    
    // 显示最优方案描述
    const resultCard = document.querySelector('.result-section .result-card:nth-child(2)');
    if (resultCard) {
        const bestLayoutInfo = document.createElement('div');
        bestLayoutInfo.className = 'best-layout-info';
        bestLayoutInfo.innerHTML = `
            <div class="result-row">
                <span>最优摆放:</span>
                <span>${bestResult.layoutName}</span>
            </div>
            <div class="result-row">
                <span>空间利用率:</span>
                <span>${bestResult.efficiency}%</span>
            </div>
        `;
        resultCard.appendChild(bestLayoutInfo);
    }
}

// 新功能：显示托盘数量计算
function displayPalletCountInfo(totalPieces, bundlesPerPallet, pcsPerBundle) {
    // 找到结果显示区域
    const resultCards = document.querySelectorAll('.result-section .result-card');
    let palletCard = document.querySelector('.pallet-count-card');
    
    // 如果不存在托盘计算卡片，创建一个
    if (!palletCard && resultCards.length > 0) {
        palletCard = document.createElement('div');
        palletCard.className = 'result-card pallet-count-card';
        palletCard.innerHTML = '<h3>托盘数量计算</h3>';
        document.querySelector('.result-section').appendChild(palletCard);
    }
    
    if (palletCard) {
        // 计算需要多少个托盘来装一定数量的纸箱
        const piecesPerPallet = bundlesPerPallet * pcsPerBundle;
        
        // 示例：如果需要装1000片，计算需要多少托盘
        const targetPieces = 1000;
        const palletsNeeded = Math.ceil(targetPieces / piecesPerPallet);
        const piecesInPallets = palletsNeeded * piecesPerPallet;
        const remainingPieces = piecesInPallets - targetPieces;
        
        palletCard.innerHTML = `
            <h3>托盘数量计算</h3>
            <div class="result-row">
                <span>每托盘片数:</span>
                <span>${piecesPerPallet.toLocaleString()} 片</span>
            </div>
            <div class="result-row">
                <span>每托盘捆数:</span>
                <span>${bundlesPerPallet} 捆</span>
            </div>
            <div class="result-row highlight">
                <span>装${targetPieces}片需要:</span>
                <span>${palletsNeeded} 个托盘</span>
            </div>
            ${remainingPieces > 0 ? `
            <div class="result-row">
                <span>可装载片数:</span>
                <span>${piecesInPallets.toLocaleString()} 片</span>
            </div>
            <div class="result-row">
                <span>多出片数:</span>
                <span>${remainingPieces} 片</span>
            </div>` : ''}
        `;
    }
}

// 页面加载时自动计算一次
document.addEventListener('DOMContentLoaded', function() {
    // 初始化计算
    calculate();
    
    // 为输入框添加实时计算
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('input', calculate);
    });
});
