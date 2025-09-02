// Flute 类型参数配置
const FLUTE_PARAMS = {
    BAF: { layers: 14, pcsPerBundle: 10 },
    AF: { layers: 20, pcsPerBundle: 10 },
    BF: { layers: 16, pcsPerBundle: 20 }
};

// Pallet 尺寸标准
const PALLET_DIMENSIONS = {
    width: 1200,      // 标准宽度
    length: 1000,     // 标准长度
    maxWidth: 1300,   // 最大容差宽度（可接受范围）
    maxLength: 1100   // 最大容差长度（可接受范围）
};

function calculate() {
    // 获取用户输入
    const length = parseFloat(document.getElementById('length').value);
    const width = parseFloat(document.getElementById('width').value);
    const height = parseFloat(document.getElementById('height').value);
    const fluteType = document.getElementById('flute').value;

    // 验证输入
    if (!validateInput(length, width, height)) {
        alert('Please enter valid dimensions (1-999mm)');
        return;
    }

    // 计算中间参数
    const a = length + width;
    const b = width + height;
    
    // 计算方向数量（区分可接受范围和严重超出）
    const c = calculateDirectionQuantity(a, PALLET_DIMENSIONS.length, PALLET_DIMENSIONS.maxLength);
    const d = calculateDirectionQuantity(b, PALLET_DIMENSIONS.width, PALLET_DIMENSIONS.maxWidth);
    
    // 计算捆数和总片数
    const bundles = c * d;
    const flute = FLUTE_PARAMS[fluteType];
    const totalPcs = bundles * flute.pcsPerBundle * flute.layers;

    // 显示结果
    displayResults(a, b, c, d, bundles, totalPcs);
}

// 精确的计算逻辑
function calculateDirectionQuantity(boxDimension, palletDimension, maxDimension) {
    // 1. 完全适合：正常计算数量
    if (boxDimension <= palletDimension) {
        return Math.floor(palletDimension / boxDimension);
    }
    // 2. 轻微超出但在可接受范围内：返回1
    else if (boxDimension <= maxDimension) {
        return 1;
    }
    // 3. 严重超出可接受范围：也返回1
    else {
        return 1;
    }
}

function validateInput(length, width, height) {
    return !isNaN(length) && !isNaN(width) && !isNaN(height) &&
           length > 0 && width > 0 && height > 0;
}

function displayResults(a, b, c, d, bundles, totalPcs) {
    // 显示中间参数
    document.getElementById('param-a').textContent = `${a} mm`;
    document.getElementById('param-b').textContent = `${b} mm`;
    document.getElementById('param-c').textContent = `${c} pcs`;
    document.getElementById('param-d').textContent = `${d} pcs`;
    
    // 显示最终结果
    document.getElementById('result-bundles').textContent = `${bundles} bundle${bundles !== 1 ? 's' : ''}`;
    document.getElementById('result-total').textContent = `${totalPcs.toLocaleString()} pieces`;
}

// 页面加载时自动计算一次
document.addEventListener('DOMContentLoaded', function() {
    calculate();
    
    // 为输入框添加实时计算
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('input', calculate);
    });
});