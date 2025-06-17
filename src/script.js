// 全局变量
let categories = [];
let materials = {};
let products = {};
let currentStep = 1;
let activeTab = null;

// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
    goToStep(1);
});

// 步骤切换函数
function goToStep(step) {
    // 验证步骤切换条件
    if (!validateStepTransition(step)) {
        return;
    }
    
    // 隐藏所有步骤内容
    document.querySelectorAll('.step-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // 更新步骤指示器
    document.querySelectorAll('.step').forEach((stepEl, index) => {
        stepEl.classList.remove('active', 'completed');
        if (index + 1 === step) {
            stepEl.classList.add('active');
        } else if (index + 1 < step) {
            stepEl.classList.add('completed');
        }
    });
    
    // 显示目标步骤
    document.getElementById(`step${step}`).classList.add('active');
    currentStep = step;
    
    // 根据步骤执行特定初始化
    switch(step) {
        case 1:
            renderCategories();
            break;
        case 2:
            renderCategoryTabs();
            break;
        case 3:
            renderProductCategoryTabs();
            break;
        case 4:
            // 计算步骤不需要初始化
            break;
    }
}

// 验证步骤切换条件
function validateStepTransition(targetStep) {
    switch(targetStep) {
        case 2:
            if (categories.length === 0) {
                showMessage('请至少添加一个分类', 'error');
                return false;
            }
            break;
        case 3:
            // 检查是否所有分类都有材料
            let hasAllMaterials = true;
            for (let category of categories) {
                if (!materials[category.id] || materials[category.id].length === 0) {
                    hasAllMaterials = false;
                    break;
                }
            }
            if (!hasAllMaterials) {
                showMessage('请为每个分类至少添加一个材料', 'error');
                return false;
            }
            break;
        case 4:
            // 检查是否所有分类都有产物
            let hasAllProducts = true;
            for (let category of categories) {
                if (!products[category.id] || products[category.id].length === 0) {
                    hasAllProducts = false;
                    break;
                }
            }
            if (!hasAllProducts) {
                showMessage('请为每个分类至少添加一个产物', 'error');
                return false;
            }
            break;
    }
    return true;
}

// 显示消息
function showMessage(text, type = 'error') {
    // 移除现有toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // 创建新toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = text;
    
    // 添加到页面
    document.body.appendChild(toast);
    
    // 显示toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // 自动隐藏toast
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast && toast.parentNode) {
                toast.remove();
            }
        }, 300);
    }, 500); // 0.5秒后开始隐藏
}

// ========== 步骤1：分类管理 ==========
function addCategory() {
    const input = document.getElementById('categoryInput');
    const name = input.value.trim();
    
    if (!name) {
        showMessage('请输入分类名称', 'error');
        return;
    }
    
    if (categories.find(cat => cat.name === name)) {
        showMessage('分类名称已存在', 'error');
        return;
    }
    
    const newCategory = {
        id: Date.now().toString(),
        name: name
    };
    
    categories.push(newCategory);
    materials[newCategory.id] = [];
    products[newCategory.id] = [];
    
    input.value = '';
    renderCategories();
    showMessage('分类添加成功', 'success');
}

function removeCategory(categoryId) {
    categories = categories.filter(cat => cat.id !== categoryId);
    delete materials[categoryId];
    delete products[categoryId];
    renderCategories();
    showMessage('分类删除成功', 'delete');
}

function renderCategories() {
    const container = document.getElementById('categoriesList');
    
    if (categories.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #718096; padding: 40px;">暂无分类，请添加分类</p>';
        return;
    }
    
    container.innerHTML = categories.map(category => `
        <div class="category-item">
            <span class="category-name">${category.name}</span>
            <button class="delete-btn" onclick="removeCategory('${category.id}')">删除</button>
        </div>
    `).join('');
}

// 允许回车添加分类
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && e.target.id === 'categoryInput') {
        addCategory();
    }
});

// ========== 步骤2：材料管理 ==========
function renderCategoryTabs() {
    const container = document.getElementById('categoryTabs');
    
    container.innerHTML = categories.map((category, index) => `
        <button class="tab-button" 
                onclick="switchMaterialTab('${category.id}')">
            ${category.name}
        </button>
    `).join('');
    
    // 清空材料区域，显示提示信息
    const materialsSection = document.getElementById('materialsSection');
    materialsSection.innerHTML = `
        <div class="tab-content active">
            <div class="selection-prompt">
                <span class="icon">📦</span>
                <h3>请选择一个分类</h3>
                <p>点击上方的分类标签来添加该分类的材料<br>包括材料名称、价格和数量</p>
            </div>
        </div>
    `;
}

function switchMaterialTab(categoryId) {
    // 更新标签状态
    document.querySelectorAll('#categoryTabs .tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 找到被点击的按钮并设置为active
    const clickedButton = Array.from(document.querySelectorAll('#categoryTabs .tab-button')).find(btn => 
        btn.getAttribute('onclick').includes(categoryId)
    );
    if (clickedButton) {
        clickedButton.classList.add('active');
    }
    
    activeTab = categoryId;
    renderMaterialsForCategory(categoryId);
}

function renderMaterialsForCategory(categoryId) {
    const category = categories.find(cat => cat.id === categoryId);
    const categoryMaterials = materials[categoryId] || [];
    
    const container = document.getElementById('materialsSection');
    
    container.innerHTML = `
        <div class="tab-content active">
            <div class="add-item-form">
                <div class="form-row material-form">
                    <div class="form-group">
                        <label>材料名称</label>
                        <input type="text" id="materialName-${categoryId}" placeholder="输入材料名称">
                    </div>
                    <div class="form-group">
                        <label>材料价格</label>
                        <input type="number" id="materialPrice-${categoryId}" placeholder="0.00" step="0.01" min="0">
                    </div>
                    <div class="form-group">
                        <label>材料数量</label>
                        <input type="number" id="materialCount-${categoryId}" placeholder="1" min="1" value="1">
                    </div>
                    <button class="btn btn-primary" onclick="addMaterial('${categoryId}')">添加材料</button>
                </div>
            </div>
            
            <div class="items-list" id="materialsList-${categoryId}">
                ${categoryMaterials.map(material => `
                    <div class="item-card">
                        <div class="item-info">
                            <div class="item-name">${material.name}</div>
                            <div class="item-details">数量: ${material.count}</div>
                        </div>
                        <div>价格: ¥${material.price.toFixed(2)}</div>
                        <div>总价: ¥${(material.price * material.count).toFixed(2)}</div>
                        <button class="delete-btn" onclick="removeMaterial('${categoryId}', '${material.id}')">删除</button>
                    </div>
                `).join('')}
            </div>
            
            ${categoryMaterials.length === 0 ? 
                '<p style="text-align: center; color: #718096; padding: 40px;">暂无材料，请添加材料</p>' : 
                ''
            }
        </div>
    `;
}

function addMaterial(categoryId) {
    const nameInput = document.getElementById(`materialName-${categoryId}`);
    const priceInput = document.getElementById(`materialPrice-${categoryId}`);
    const countInput = document.getElementById(`materialCount-${categoryId}`);
    
    const name = nameInput.value.trim();
    const price = parseFloat(priceInput.value) || 0;
    const count = parseInt(countInput.value) || 1;
    
    if (!name) {
        showMessage('请输入材料名称', 'error');
        return;
    }
    
    if (price <= 0) {
        showMessage('请输入有效的材料价格', 'error');
        return;
    }
    
    if (count <= 0) {
        showMessage('请输入有效的材料数量', 'error');
        return;
    }
    
    const newMaterial = {
        id: Date.now().toString(),
        name: name,
        price: price,
        count: count
    };
    
    materials[categoryId].push(newMaterial);
    
    // 清空输入框
    nameInput.value = '';
    priceInput.value = '';
    countInput.value = '1';
    
    renderMaterialsForCategory(categoryId);
    showMessage('材料添加成功', 'success');
}

function removeMaterial(categoryId, materialId) {
    materials[categoryId] = materials[categoryId].filter(mat => mat.id !== materialId);
    renderMaterialsForCategory(categoryId);
    showMessage('材料删除成功', 'delete');
}

// ========== 步骤3：产物管理 ==========
function renderProductCategoryTabs() {
    const container = document.getElementById('productCategoryTabs');
    
    container.innerHTML = categories.map((category, index) => `
        <button class="tab-button" 
                onclick="switchProductTab('${category.id}')">
            ${category.name}
        </button>
    `).join('');
    
    // 清空产物区域，显示提示信息
    const productsSection = document.getElementById('productsSection');
    productsSection.innerHTML = `
        <div class="tab-content active">
            <div class="selection-prompt">
                <span class="icon">🎁</span>
                <h3>请选择一个分类</h3>
                <p>点击上方的分类标签来添加该分类的产物<br>包括产物名称和价格</p>
            </div>
        </div>
    `;
}

function switchProductTab(categoryId) {
    // 更新标签状态
    document.querySelectorAll('#productCategoryTabs .tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 找到被点击的按钮并设置为active
    const clickedButton = Array.from(document.querySelectorAll('#productCategoryTabs .tab-button')).find(btn => 
        btn.getAttribute('onclick').includes(categoryId)
    );
    if (clickedButton) {
        clickedButton.classList.add('active');
    }
    
    activeTab = categoryId;
    renderProductsForCategory(categoryId);
}

function renderProductsForCategory(categoryId) {
    const category = categories.find(cat => cat.id === categoryId);
    const categoryProducts = products[categoryId] || [];
    
    const container = document.getElementById('productsSection');
    
    container.innerHTML = `
        <div class="tab-content active">
            <div class="add-item-form">
                <div class="form-row">
                    <div class="form-group">
                        <label>产物名称</label>
                        <input type="text" id="productName-${categoryId}" placeholder="输入产物名称">
                    </div>
                    <div class="form-group">
                        <label>产物价格</label>
                        <input type="number" id="productPrice-${categoryId}" placeholder="0.00" step="0.01" min="0">
                    </div>
                    <button class="btn btn-primary" onclick="addProduct('${categoryId}')">添加产物</button>
                </div>
            </div>
            
            <div class="items-list" id="productsList-${categoryId}">
                ${categoryProducts.map((product, index) => `
                    <div class="item-card">
                        <div class="item-info">
                            <div class="item-name">${product.name}</div>
                            <div class="item-details">概率: ${(100 / categoryProducts.length).toFixed(2)}%</div>
                        </div>
                        <div>价格: ¥${product.price.toFixed(2)}</div>
                        <div></div>
                        <button class="delete-btn" onclick="removeProduct('${categoryId}', '${product.id}')">删除</button>
                    </div>
                `).join('')}
            </div>
            
            ${categoryProducts.length === 0 ? 
                '<p style="text-align: center; color: #718096; padding: 40px;">暂无产物，请添加产物</p>' : 
                ''
            }
        </div>
    `;
}

function addProduct(categoryId) {
    const nameInput = document.getElementById(`productName-${categoryId}`);
    const priceInput = document.getElementById(`productPrice-${categoryId}`);
    
    const name = nameInput.value.trim();
    const price = parseFloat(priceInput.value) || 0;
    
    if (!name) {
        showMessage('请输入产物名称', 'error');
        return;
    }
    
    if (price <= 0) {
        showMessage('请输入有效的产物价格', 'error');
        return;
    }
    
    const newProduct = {
        id: Date.now().toString(),
        name: name,
        price: price
    };
    
    products[categoryId].push(newProduct);
    
    // 清空输入框
    nameInput.value = '';
    priceInput.value = '';
    
    renderProductsForCategory(categoryId);
    showMessage('产物添加成功', 'success');
}

function removeProduct(categoryId, productId) {
    products[categoryId] = products[categoryId].filter(prod => prod.id !== productId);
    renderProductsForCategory(categoryId);
    showMessage('产物删除成功', 'delete');
}

// ========== 步骤4：计算结果 ==========
function calculateResults() {
    const button = event.target;
    const originalText = button.textContent;
    
    // 显示加载状态
    button.innerHTML = '<span class="loading"></span> 计算中...';
    button.disabled = true;
    
    setTimeout(() => {
        try {
            const results = performCalculation();
            displayResults(results);
            
            button.textContent = '重新计算';
            button.disabled = false;
        } catch (error) {
            showMessage('计算过程中出现错误，请检查数据', 'error');
            button.textContent = originalText;
            button.disabled = false;
        }
    }, 1000);
}

function performCalculation() {
    let totalMaterials = 0;
    let totalMaterialCost = 0;
    
    // 计算总材料数和总成本
    categories.forEach(category => {
        const categoryMaterials = materials[category.id] || [];
        categoryMaterials.forEach(material => {
            totalMaterials += material.count;
            totalMaterialCost += material.price * material.count;
        });
    });
    
    if (totalMaterials === 0) {
        throw new Error('没有材料数据');
    }
    
    // 计算当前配置的期望值
    // 根据公式: E = Σ[(Xi - X0) * Pi]
    // 其中 X0 是总材料价格，Xi 是第i个产物价格，Pi 是第i个产物概率
    let currentExpectedValue = 0;
    
    categories.forEach(category => {
        const categoryMaterials = materials[category.id] || [];
        const categoryProducts = products[category.id] || [];
        
        if (categoryMaterials.length === 0 || categoryProducts.length === 0) return;
        
        const categoryMaterialCount = categoryMaterials.reduce((sum, mat) => sum + mat.count, 0);
        const categoryMaterialCost = categoryMaterials.reduce((sum, mat) => sum + mat.price * mat.count, 0);
        
        // 该分类被选中的概率 = 该分类材料数量 / 总材料数量
        const categorySelectionProbability = categoryMaterialCount / totalMaterials;
        
        // 该分类内每个产物的概率 = 1 / 产物数量
        const productProbability = 1 / categoryProducts.length;
        
        categoryProducts.forEach(product => {
            // 实际概率 = 分类被选中概率 × 产物在分类内的概率
            const actualProbability = categorySelectionProbability * productProbability;
            
            // 根据公式计算期望值: (产物价格 - 总材料成本) × 概率
            const expectedValue = (product.price - totalMaterialCost) * actualProbability;
            currentExpectedValue += expectedValue;
        });
    });
    
    // 计算所有可能的分配方案
    let categoryAnalysis = [];
    categories.forEach(category => {
        const categoryMaterials = materials[category.id] || [];
        const categoryProducts = products[category.id] || [];
        
        if (categoryMaterials.length === 0 || categoryProducts.length === 0) return;
        
        // 计算如果所有材料都分配给这个分类的期望值
        let categoryExpectedValue = 0;
        let categoryRiskRewardScore = 0;
        let categoryReturnRate = 0;
        let categoryBreakevenRate = 0;
        
        // 计算期望值
        categoryProducts.forEach(product => {
            const probability = 1 / categoryProducts.length;
            const expectedValue = (product.price - totalMaterialCost) * probability;
            categoryExpectedValue += expectedValue;
        });
        
        // 计算高风险高回报评分
        const riskRewardMetrics = calculateRiskRewardScore(categoryProducts, totalMaterialCost);
        
        categoryAnalysis.push({
            categoryId: category.id,
            categoryName: category.name,
            expectedValue: categoryExpectedValue,
            riskRewardScore: riskRewardMetrics.riskRewardScore,
            returnRate: riskRewardMetrics.returnRate,
            breakevenRate: riskRewardMetrics.breakevenRate,
            maxReturn: riskRewardMetrics.maxReturn,
            avgMaterialCost: categoryMaterials.reduce((sum, mat) => sum + mat.price, 0) / categoryMaterials.length,
            avgProductPrice: categoryProducts.reduce((sum, prod) => sum + prod.price, 0) / categoryProducts.length,
            productCount: categoryProducts.length,
            products: categoryProducts
        });
    });
      // 按期望收益排序（传统最优方案）
    const expectedValueRanking = [...categoryAnalysis].sort((a, b) => b.expectedValue - a.expectedValue);
    
    // 按风险收益比排序（高风险高回报方案）
    const riskRewardRanking = [...categoryAnalysis].sort((a, b) => b.riskRewardScore - a.riskRewardScore);
      // 最优期望值方案（多分类分配，每分类至少1个材料）
    let bestExpectedValue = 0;
    let bestAllocation = {};
    if (expectedValueRanking.length > 0) {
        bestAllocation = calculateOptimalAllocation(expectedValueRanking, totalMaterials, 'expected');
        bestExpectedValue = calculateAllocationExpectedValue(bestAllocation, categoryAnalysis, totalMaterialCost);
        console.log('传统策略分配:', bestAllocation);
        console.log('传统策略期望值:', bestExpectedValue);
    }
    
    // 高风险高回报方案（更激进的分配策略）
    let riskRewardExpectedValue = 0;
    let riskRewardAllocation = {};
    if (riskRewardRanking.length > 0) {
        riskRewardAllocation = calculateOptimalAllocation(riskRewardRanking, totalMaterials, 'riskReward');
        riskRewardExpectedValue = calculateAllocationExpectedValue(riskRewardAllocation, categoryAnalysis, totalMaterialCost);
        console.log('高风险策略分配:', riskRewardAllocation);
        console.log('高风险策略期望值:', riskRewardExpectedValue);
        console.log('期望值排序:', expectedValueRanking.map(c => ({ name: c.categoryName, score: c.expectedValue.toFixed(2) })));
        console.log('风险收益排序:', riskRewardRanking.map(c => ({ name: c.categoryName, score: c.riskRewardScore.toFixed(1) })));
    }
    
    // 确保最优期望值不小于当前期望值
    if (bestExpectedValue < currentExpectedValue) {
        bestExpectedValue = currentExpectedValue;
        bestAllocation = {};
        categories.forEach(category => {
            const categoryMaterials = materials[category.id] || [];
            const materialCount = categoryMaterials.reduce((sum, mat) => sum + mat.count, 0);
            if (materialCount > 0) {
                bestAllocation[category.id] = materialCount;
            }
        });
    }
    
    return {
        currentExpectedValue: currentExpectedValue,
        bestExpectedValue: bestExpectedValue,
        bestAllocation: bestAllocation,
        riskRewardExpectedValue: riskRewardExpectedValue,
        riskRewardAllocation: riskRewardAllocation,
        totalMaterials: totalMaterials,
        totalMaterialCost: totalMaterialCost,
        categoryAnalysis: expectedValueRanking,
        riskRewardAnalysis: riskRewardRanking
    };
}

// 计算最优材料分配（约束：每分类至少1个材料）
function calculateOptimalAllocation(categoryRanking, totalMaterials, strategy) {
    const allocation = {};
    const numCategories = categoryRanking.length;
    
    if (numCategories === 0) return allocation;
    
    // 每个分类至少分配1个材料
    categoryRanking.forEach(cat => {
        allocation[cat.categoryId] = 1;
    });
    
    let remainingMaterials = totalMaterials - numCategories;
      if (strategy === 'expected') {
        // 传统期望值策略：基于期望值的平衡分配
        const sortedByExpected = [...categoryRanking];
        
        // 计算总权重
        let totalWeight = 0;
        for (let i = 0; i < sortedByExpected.length; i++) {
            totalWeight += Math.pow((sortedByExpected.length - i) / sortedByExpected.length, 2);
        }
        
        // 按权重分配材料
        for (let i = 0; i < sortedByExpected.length && remainingMaterials > 0; i++) {
            const category = sortedByExpected[i];
            // 使用二次函数分配，期望值越高分配越多
            const weight = Math.pow((sortedByExpected.length - i) / sortedByExpected.length, 2);
            const additionalMaterials = Math.floor(remainingMaterials * (weight / totalWeight));
            
            allocation[category.categoryId] += additionalMaterials;
        }
        
        // 将剩余材料分配给最优分类
        const totalAllocated = Object.values(allocation).reduce((sum, count) => sum + count, 0);
        const finalRemaining = totalMaterials - totalAllocated;
        if (finalRemaining > 0) {
            allocation[sortedByExpected[0].categoryId] += finalRemaining;
        }
          } else if (strategy === 'riskReward') {
        // 高风险高回报策略：极度激进的分配
        const sortedByRisk = [...categoryRanking];
        
        // 更激进的策略：只关注风险评分前20%的分类
        const topRiskCount = Math.max(1, Math.ceil(sortedByRisk.length * 0.20));
        const topRiskCategories = sortedByRisk.slice(0, topRiskCount);
        
        // 极度激进：90%材料分配给最高风险回报分类
        const aggressiveMaterials = Math.floor(remainingMaterials * 0.90);
        const conservativeMaterials = remainingMaterials - aggressiveMaterials;
        
        // 使用极度不均衡的指数权重分配
        let totalWeight = 0;
        for (let i = 0; i < topRiskCategories.length; i++) {
            totalWeight += Math.pow(10, topRiskCategories.length - i - 1); // 超指数权重
        }
        
        for (let i = 0; i < topRiskCategories.length && aggressiveMaterials > 0; i++) {
            const category = topRiskCategories[i];
            // 使用超指数权重，让最高评分的分类获得绝大部分材料
            const weight = Math.pow(10, topRiskCategories.length - i - 1) / totalWeight;
            const additionalMaterials = Math.floor(aggressiveMaterials * weight);
            
            allocation[category.categoryId] += additionalMaterials;
        }
        
        // 其他分类只获得最少的材料（如果有剩余的话）
        const otherCategories = sortedByRisk.slice(topRiskCount);
        if (otherCategories.length > 0 && conservativeMaterials > 0) {
            // 甚至保守材料也不均匀分配，优先给风险评分较高的
            const sortedOthers = otherCategories.sort((a, b) => b.riskRewardScore - a.riskRewardScore);
            const firstOther = sortedOthers[0];
            if (firstOther) {
                allocation[firstOther.categoryId] += conservativeMaterials;
            }
        }
        
        // 将所有剩余的零头都分配给风险评分最高的分类
        const totalAllocated = Object.values(allocation).reduce((sum, count) => sum + count, 0);
        const finalRemaining = totalMaterials - totalAllocated;
        if (finalRemaining > 0) {
            allocation[sortedByRisk[0].categoryId] += finalRemaining;
        }
    }
    
    return allocation;
}

// 计算分配方案的期望值
function calculateAllocationExpectedValue(allocation, categoryAnalysis, totalMaterialCost) {
    let expectedValue = 0;
    const totalAllocatedMaterials = Object.values(allocation).reduce((sum, count) => sum + count, 0);
    
    Object.entries(allocation).forEach(([categoryId, materialCount]) => {
        const categoryData = categoryAnalysis.find(cat => cat.categoryId === categoryId);
        if (categoryData && materialCount > 0) {
            // 计算该分类被选中的概率
            const selectionProbability = materialCount / totalAllocatedMaterials;
            
            // 计算该分类的期望收益
            categoryData.products.forEach(product => {
                const productProbability = 1 / categoryData.products.length;
                const actualProbability = selectionProbability * productProbability;
                const productExpectedValue = (product.price - totalMaterialCost) * actualProbability;
                expectedValue += productExpectedValue;
            });
        }
    });
    
    return expectedValue;
}

// 计算风险收益评分算法（高复杂度，大幅增强高回报贡献）
function calculateRiskRewardScore(products, totalCost) {
    if (products.length === 0) {
        return {
            riskRewardScore: 0,
            returnRate: 0,
            breakevenRate: 0,
            maxReturn: 0,
            returnVariance: 0,
            extremeReturnRate: 0
        };
    }
    
    // 计算各种回报指标
    const returns = products.map(p => Math.max(0, (p.price - totalCost) / totalCost));
    const returnMultipliers = products.map(p => p.price / totalCost);
    
    // 1. 回本率（基础安全性）
    const profitableProducts = products.filter(p => p.price >= totalCost);
    const breakevenRate = profitableProducts.length / products.length;
    
    // 2. 平均回报率
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    
    // 3. 最大回报倍数（指数放大）
    const maxReturn = Math.max(...returnMultipliers);
    const maxReturnBonus = Math.pow(Math.min(maxReturn, 100), 1.5); // 指数放大效果
    
    // 4. 超高回报比例（3倍以上，平方放大）
    const highReturnProducts = products.filter(p => p.price / totalCost > 3);
    const highReturnRate = highReturnProducts.length / products.length;
    const highReturnBonus = Math.pow(highReturnRate, 0.7) * 2; // 平方根放大
      // 5. 极端回报比例（5倍以上，立方放大）
    const extremeReturnProducts = products.filter(p => p.price / totalCost > 5);
    const extremeReturnRate = extremeReturnProducts.length / products.length;
    const extremeReturnBonus = Math.pow(extremeReturnRate, 0.5) * 5; // 极端奖励
    
    // 6. 回报方差（衡量波动性，高波动=高风险高回报）
    const returnVariance = returns.length > 1 ? 
        returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length : 0;
    const varianceBonus = Math.sqrt(returnVariance) * 3;
    
    // 7. 回报分布偏度（偏向高回报的分布）
    const sortedReturns = [...returns].sort((a, b) => b - a);
    const top20PercentCount = Math.ceil(sortedReturns.length * 0.2);
    const top20PercentAvg = sortedReturns.slice(0, top20PercentCount).reduce((sum, r) => sum + r, 0) / top20PercentCount;
    const skewnessBonus = Math.pow(top20PercentAvg, 1.2);
      // 8. 连续高回报奖励
    let consecutiveHighReturns = 0;
    let maxConsecutive = 0;
    const sortedProducts = [...products].sort((a, b) => b.price - a.price);
    for (let product of sortedProducts) {
        if (product.price / totalCost > 5) {
            consecutiveHighReturns++;
            maxConsecutive = Math.max(maxConsecutive, consecutiveHighReturns);
        } else {
            consecutiveHighReturns = 0;
        }
    }
    const consecutiveBonus = Math.pow(maxConsecutive, 1.5);
    
    // 复合风险收益评分算法（大幅增强高回报权重）：
    const weights = {
        breakeven: 0.15,      // 降低回本率权重
        avgReturn: 0.10,      // 降低平均回报权重
        maxReturn: 0.25,      // 大幅提升最大回报权重
        highReturn: 0.20,     // 保持超高回报权重
        extremeReturn: 0.15,  // 新增极端回报权重
        variance: 0.08,       // 新增方差权重
        skewness: 0.07        // 新增偏度权重
    };
    
    // 标准化处理（使用更激进的标准化）
    const normalizedBreakeven = Math.min(breakevenRate, 1);
    const normalizedAvgReturn = Math.min(avgReturn / 5, 1); // 降低标准，更容易达到满分
    const normalizedMaxReturn = Math.min(maxReturnBonus / 200, 1);
    const normalizedHighReturn = Math.min(highReturnBonus / 2, 1);
    const normalizedExtremeReturn = Math.min(extremeReturnBonus / 5, 1);
    const normalizedVariance = Math.min(varianceBonus / 10, 1);
    const normalizedSkewness = Math.min(skewnessBonus / 20, 1);
    
    // 计算最终评分（使用非线性组合）
    let baseScore = 
        normalizedBreakeven * weights.breakeven +
        normalizedAvgReturn * weights.avgReturn +
        normalizedMaxReturn * weights.maxReturn +
        normalizedHighReturn * weights.highReturn +
        normalizedExtremeReturn * weights.extremeReturn +
        normalizedVariance * weights.variance +
        normalizedSkewness * weights.skewness;
    
    // 应用连续高回报奖励（乘数效应）
    const consecutiveMultiplier = 1 + (consecutiveBonus * 0.1);
    const finalScore = baseScore * consecutiveMultiplier;
      return {
        riskRewardScore: Math.min(finalScore * 100, 200), // 允许评分达到200分，增加差异化
        returnRate: avgReturn * 100,
        breakevenRate: breakevenRate * 100,
        maxReturn: maxReturn,
        returnVariance: returnVariance,
        extremeReturnRate: extremeReturnRate * 100
    };
}

function displayResults(results) {
    const container = document.getElementById('resultsDisplay');
    
    // 生成当前分配显示
    let currentAllocationHTML = '';
    categories.forEach(category => {
        const categoryMaterials = materials[category.id] || [];
        const materialCount = categoryMaterials.reduce((sum, mat) => sum + mat.count, 0);
        if (materialCount > 0) {
            currentAllocationHTML += `
                <div class="allocation-item">
                    <span class="allocation-name">${category.name}</span>
                    <span class="allocation-count">${materialCount}个材料</span>
                </div>
            `;
        }
    });
    
    // 生成最优期望值分配显示
    let bestAllocationHTML = '';
    if (Object.keys(results.bestAllocation).length > 0) {
        bestAllocationHTML = Object.entries(results.bestAllocation).map(([categoryId, count]) => {
            const category = categories.find(cat => cat.id === categoryId);
            return `
                <div class="allocation-item">
                    <span class="allocation-name">${category.name}</span>
                    <span class="allocation-count">${count}个材料</span>
                </div>
            `;
        }).join('');
    } else {
        bestAllocationHTML = '<p style="text-align: center; color: #718096;">无法计算最优分配</p>';
    }
    
    // 生成高风险高回报分配显示
    let riskRewardAllocationHTML = '';
    if (Object.keys(results.riskRewardAllocation).length > 0) {
        riskRewardAllocationHTML = Object.entries(results.riskRewardAllocation).map(([categoryId, count]) => {
            const category = categories.find(cat => cat.id === categoryId);
            const categoryData = results.riskRewardAnalysis.find(cat => cat.categoryId === categoryId);
            return `
                <div class="allocation-item">
                    <div class="allocation-name">
                        <div style="font-weight: bold;">${category.name}</div>
                        <div style="font-size: 12px; color: #666; margin-top: 4px;">
                            回本率: ${categoryData.breakevenRate.toFixed(1)}% | 
                            平均回报率: ${categoryData.returnRate.toFixed(1)}% | 
                            最大回报: ${categoryData.maxReturn.toFixed(1)}倍
                        </div>
                    </div>
                    <span class="allocation-count">${count}个材料</span>
                </div>
            `;
        }).join('');
    } else {
        riskRewardAllocationHTML = '<p style="text-align: center; color: #718096;">无法计算高风险高回报分配</p>';
    }
    
    container.innerHTML = `
        <div class="expectation-cards">
            <div class="expectation-card">
                <div class="expectation-label">当前数学期望</div>
                <div class="expectation-value">¥${results.currentExpectedValue.toFixed(2)}</div>
                <div style="font-size: 14px; opacity: 0.8; margin-top: 8px;">
                    基于当前材料分配计算
                </div>
            </div>
            <div class="expectation-card optimal">
                <div class="expectation-label">最优数学期望</div>
                <div class="expectation-value">¥${results.bestExpectedValue.toFixed(2)}</div>
                <div style="font-size: 14px; opacity: 0.8; margin-top: 8px;">
                    传统期望值最大化方案
                </div>
            </div>
            <div class="expectation-card risk-reward">
                <div class="expectation-label">高风险高回报方案</div>
                <div class="expectation-value">¥${results.riskRewardExpectedValue.toFixed(2)}</div>
                <div style="font-size: 14px; opacity: 0.8; margin-top: 8px;">
                    平衡回本率与回报率
                </div>
            </div>
        </div>
        
        <div class="allocation-section">
            <h3>计算参数</h3>
            <div class="allocation-list">
                <div class="allocation-item">
                    <span class="allocation-name">总材料数量</span>
                    <span class="allocation-count">${results.totalMaterials}个</span>
                </div>
                <div class="allocation-item">
                    <span class="allocation-name">总材料成本 (X₀)</span>
                    <span class="allocation-count">¥${results.totalMaterialCost.toFixed(2)}</span>
                </div>
            </div>
        </div>
        
        <div class="allocation-section">
            <h3>当前材料分配</h3>
            <div class="allocation-list">
                ${currentAllocationHTML || '<p style="text-align: center; color: #718096;">暂无材料分配</p>'}
            </div>
        </div>
        
        <div class="allocation-section">
            <h3>最优期望值方案</h3>
            <div class="allocation-list">
                ${bestAllocationHTML}
            </div>
        </div>
        
        <div class="allocation-section" style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%); color: white;">
            <h3 style="color: white;">🎯 高风险高回报方案</h3>
            <div class="allocation-list">
                ${riskRewardAllocationHTML}
            </div>
        </div>
        
        <div class="allocation-section">
            <h3>期望值排序 (传统方案)</h3>
            <div class="allocation-list">
                ${results.categoryAnalysis.map((cat, index) => `
                    <div class="allocation-item">
                        <div class="allocation-name">
                            <div style="font-weight: bold;">${index + 1}. ${cat.categoryName}</div>
                            <div style="font-size: 12px; color: #666; margin-top: 4px;">
                                产物数量: ${cat.productCount} | 平均产物价格: ¥${cat.avgProductPrice.toFixed(2)}
                            </div>
                        </div>
                        <span class="allocation-count">期望: ¥${cat.expectedValue.toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="allocation-section">
            <h3>风险收益排序 (高风险高回报)</h3>
            <div class="allocation-list">
                ${results.riskRewardAnalysis.map((cat, index) => `
                    <div class="allocation-item">
                        <div class="allocation-name">
                            <div style="font-weight: bold;">${index + 1}. ${cat.categoryName}</div>
                            <div style="font-size: 12px; color: #666; margin-top: 4px;">
                                综合评分: ${cat.riskRewardScore.toFixed(1)}分 | 
                                回本率: ${cat.breakevenRate.toFixed(1)}% | 
                                平均回报: ${cat.returnRate.toFixed(1)}%
                            </div>
                            <div style="font-size: 12px; color: #666; margin-top: 2px;">
                                最大回报: ${cat.maxReturn.toFixed(1)}倍 | 
                                期望收益: ¥${cat.expectedValue.toFixed(2)}
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 16px; font-weight: bold; color: #fff;">
                                ${cat.riskRewardScore.toFixed(1)}分
                            </div>
                            <div style="font-size: 12px; color: rgba(255,255,255,0.8);">
                                风险收益比
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
          <div class="allocation-section" style="background: #f0f8ff; border-left: 4px solid #667eea;">
            <h3 style="color: #667eea;">🧮 算法说明</h3>
            <div style="padding: 15px; background: white; border-radius: 8px;">
                <div style="margin-bottom: 15px;">
                    <strong>高复杂度风险收益评分算法：</strong>
                </div>
                <div style="font-size: 14px; line-height: 1.6;">
                    <div>• <strong>回本率</strong> (15%权重)：基础安全保障</div>
                    <div>• <strong>平均回报率</strong> (10%权重)：稳定收益指标</div>
                    <div>• <strong>最大回报倍数</strong> (25%权重)：爆发潜力，指数放大</div>
                    <div>• <strong>超高回报比例</strong> (20%权重)：>3倍回报产物占比</div>
                    <div>• <strong>极端回报比例</strong> (15%权重)：>5倍回报产物占比</div>
                    <div>• <strong>回报方差</strong> (8%权重)：波动性奖励</div>
                    <div>• <strong>分布偏度</strong> (7%权重)：极值分布奖励</div>
                </div>
                <div style="margin-top: 15px;">
                    <strong>分配策略差异：</strong>
                </div>
                <div style="font-size: 14px; line-height: 1.6;">
                    <div>• <strong>传统策略</strong>：二次函数权重分配，均衡考虑期望值</div>
                    <div>• <strong>高风险策略</strong>：90%材料集中分配给前20%高评分分类，超指数权重</div>
                </div>
                <div style="margin-top: 10px; font-size: 13px; color: #666;">
                    高风险策略使用非线性函数和极端权重分配，最大化高回报潜力
                </div>
            </div>
        </div>
    `;
    
    container.classList.add('show');
}

// ========== 重置功能 ==========
function resetAll() {
    categories = [];
    materials = {};
    products = {};
    currentStep = 1;
    activeTab = null;
    
    // 隐藏结果
    const resultsDisplay = document.getElementById('resultsDisplay');
    if (resultsDisplay) {
        resultsDisplay.classList.remove('show');
    }
    
    goToStep(1);    showMessage('所有数据已重置', 'delete');
}
