// Flute 类型参数配置
const FLUTE_PARAMS = {
    BAF: { layers: 14, pcsPerBundle: 10 },
    AF: { layers: 20, pcsPerBundle: 10 },
    BF: { layers: 16, pcsPerBundle: 20 }
};

// Pallet 固定尺寸
const PALLET_DIMENSIONS = {
    width: 1200,
    length: 1000
};

function calculate() {
    // 获取用户输入
    const length = parseFloat(document.getElementById('length').value);
    const width = parseFloat(document.getElementById('width').value);
    const height = parseFloat(document.getElementById('height').value);
    const fluteType = document.getElementById('flute').value;

    // 验证输入
    if (!validateInput(length, width, height)) {
        alert('请输入有效的尺寸数值（1-999mm）');
        return;
    }

    // 计算中间参数
    const a = length + width;
    const b = width + height;
    
    // 计算方向数量
    const c = Math.floor(PALLET_DIMENSIONS.length / a);
    const d = Math.floor(PALLET_DIMENSIONS.width / b);
    
    // 计算捆数和总片数
    const bundles = c * d;
    const flute = FLUTE_PARAMS[fluteType];
    const totalPcs = bundles * flute.pcsPerBundle * flute.layers;

    // 显示结果
    displayResults(a, b, c, d, bundles, totalPcs);
}

function validateInput(length, width, height) {
    return !isNaN(length) && !isNaN(width) && !isNaN(height) &&
           length > 0 && width > 0 && height > 0;
}

function displayResults(a, b, c, d, bundles, totalPcs) {
    // 显示中间参数
    document.getElementById('param-a').textContent = `${a} mm`;
    document.getElementById('param-b').textContent = `${b} mm`;
    document.getElementById('param-c').textContent = `${c} `;
    document.getElementById('param-d').textContent = `${d} `;
    
    // 显示最终结果
    document.getElementById('result-bundles').textContent = `${bundles} bundles`;
    document.getElementById('result-total').textContent = `${totalPcs.toLocaleString()} pcs`;
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