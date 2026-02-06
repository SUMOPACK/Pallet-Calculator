// Flute 类型参数配置
const FLUTE_PARAMS = {
    BAF: { layers: 14, pcsPerBundle: 10 },
    AF: { layers: 20, pcsPerBundle: 10 },
    BF: { layers: 16, pcsPerBundle: 20 }
};

// Pallet 尺寸标准 - 只使用最大容差尺寸
const PALLET_DIMENSIONS = {
    width: 1300,   // 最大容差宽度
    length: 1250   // 最大容差长度
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
    
    // 计算方向数量（基于1300x1250mm）
    const c = Math.floor(PALLET_DIMENSIONS.length / a);
    const d = Math.floor(PALLET_DIMENSIONS.width / b);
    
    // 确保至少为1
    const cCount = Math.max(1, c);
    const dCount = Math.max(1, d);
    
    // 计算捆数和总片数
    const bundles = cCount * dCount;
    const flute = FLUTE_PARAMS[fluteType];
    const totalPcs = bundles * flute.pcsPerBundle * flute.layers;

    // 显示结果
    displayResults(a, b, cCount, dCount, bundles, totalPcs);
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


