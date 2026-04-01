/**
 * Вычисление ширины (props_x) и длины (props_y) на основе static-geometry/prop/position
 * Формула: diff / 500.0 + 1, затем Math.ceil
 */
function calculateWidthAndLength(staticGeomElement) {
    if (!staticGeomElement) return null;
    
    // все prop внутри static-geometry
    const props = staticGeomElement.querySelectorAll('prop');
    if (props.length === 0) return null;

    const allX = [];
    const allY = [];
    
    for (const prop of props) {
        const position = prop.querySelector('position');
        if (!position) continue;
        
        const xElem = position.querySelector('x');
        const yElem = position.querySelector('y');
        if (!xElem || !yElem) continue;
        
        const x = parseFloat(xElem.textContent);
        const y = parseFloat(yElem.textContent);
        if (isNaN(x) || isNaN(y)) continue;
        
        allX.push(x);
        allY.push(y);
    }
    
    if (allX.length === 0) return null;
    
    const minX = Math.min(...allX);
    const maxX = Math.max(...allX);
    const minY = Math.min(...allY);
    const maxY = Math.max(...allY);
    
    const diffX = maxX - minX;
    const diffY = maxY - minY;
    
    const propsX = diffX / 500.0 + 1;
    const propsY = diffY / 500.0 + 1;
    
    return { props_x: Math.ceil(propsX), props_y: Math.ceil(propsY) };
}

/**
 * Вычисление высоты (props_z) на основе collision-geometry
 * Анализирует collision-box, collision-plane, collision-triangle
 * Формула: diff_z / 500.0 -> ceil
 */
function calculateHeight(collisionGeomElement) {
    if (!collisionGeomElement) return null;
    
    const allZ = [];
    
    // collision-box
    const boxes = collisionGeomElement.querySelectorAll('collision-box');
    for (const box of boxes) {
        const position = box.querySelector('position');
        const size = box.querySelector('size');
        if (!position || !size) continue;
        
        const posZ = parseFloat(position.querySelector('z')?.textContent);
        const sizeZ = parseFloat(size.querySelector('z')?.textContent);
        if (isNaN(posZ) || isNaN(sizeZ)) continue;
        
        allZ.push(posZ);
        allZ.push(posZ + sizeZ);
    }
    
    // collision-plane
    const planes = collisionGeomElement.querySelectorAll('collision-plane');
    for (const plane of planes) {
        const position = plane.querySelector('position');
        if (!position) continue;
        const posZ = parseFloat(position.querySelector('z')?.textContent);
        if (!isNaN(posZ)) allZ.push(posZ);
    }
    
    // collision-triangle
    const triangles = collisionGeomElement.querySelectorAll('collision-triangle');
    for (const tri of triangles) {
        const position = tri.querySelector('position');
        const v0 = tri.querySelector('v0');
        const v1 = tri.querySelector('v1');
        const v2 = tri.querySelector('v2');
        if (!position || !v0 || !v1 || !v2) continue;
        
        const posZ = parseFloat(position.querySelector('z')?.textContent);
        const v0z = parseFloat(v0.querySelector('z')?.textContent);
        const v1z = parseFloat(v1.querySelector('z')?.textContent);
        const v2z = parseFloat(v2.querySelector('z')?.textContent);
        
        if (isNaN(posZ) || isNaN(v0z) || isNaN(v1z) || isNaN(v2z)) continue;
        
        allZ.push(posZ);
        allZ.push(posZ + v0z);
        allZ.push(posZ + v1z);
        allZ.push(posZ + v2z);
    }
    
    if (allZ.length === 0) return null;
    
    const minZ = Math.min(...allZ);
    const maxZ = Math.max(...allZ);
    const diffZ = maxZ - minZ;
    const propsZ = diffZ / 500.0;
    return Math.ceil(propsZ);
}

/**
 * Основная функция расчета габаритов (аналог calculate_dimensions)
 */
function calculateDimensions(xmlDoc, filename) {
    const root = xmlDoc.documentElement;
    if (!root) return null;
    
    const staticGeom = root.querySelector('static-geometry');
    const collisionGeom = root.querySelector('collision-geometry');
    
    if (!staticGeom || !collisionGeom) {
        console.warn("Missing static-geometry or collision-geometry");
        return null;
    }
    
    const wh = calculateWidthAndLength(staticGeom);
    if (!wh) return null;
    
    const heightVal = calculateHeight(collisionGeom);
    if (heightVal === null) return null;
    
    return {
        filename: filename,
        props_x: wh.props_x,
        props_y: wh.props_y,
        props_z: heightVal
    };
}

/**
 * Анализ bonus-regions: фильтрация по game-mode (targetGameMode)
 * Возвращает объект с counts и total
 */
function analyzeBonusRegions(xmlDoc, targetGameMode, filename) {
    const root = xmlDoc.documentElement;
    if (!root) return null;
    
    const bonusRegions = root.querySelectorAll('bonus-region');
    if (bonusRegions.length === 0) return null;
    
    const bonusTypes = [];
    
    for (const region of bonusRegions) {
        const gameModes = region.querySelectorAll('game-mode');
        if (gameModes.length === 0) continue;
        
        // проверяем, есть ли среди game-mode текстов целевой режим
        let modeMatch = false;
        for (const gm of gameModes) {
            const modeText = gm.textContent?.trim();
            if (modeText === targetGameMode) {
                modeMatch = true;
                break;
            }
        }
        if (!modeMatch) continue;
        
        const bonusTypeElem = region.querySelector('bonus-type');
        if (bonusTypeElem && bonusTypeElem.textContent) {
            const bonusType = bonusTypeElem.textContent.trim();
            if (bonusType) bonusTypes.push(bonusType);
        }
    }
    
    if (bonusTypes.length === 0) {
        return { filename, bonus_counts: {}, total: 0 };
    }
    
    const counts = {};
    for (const bt of bonusTypes) {
        counts[bt] = (counts[bt] || 0) + 1;
    }
    
    return {
        filename: filename,
        bonus_counts: counts,
        total: bonusTypes.length
    };
}

// ---------- Функция отрисовки результатов ----------
function renderResults(dimResult, bonusResult, gameModeUsed, fileName) {
    const resultDiv = document.getElementById('resultArea');
    if (!resultDiv) return;
    
    let html = '';
    
    // Блок габаритов
    if (dimResult && dimResult.props_x !== undefined) {
        html += `
            <div class="card">
                <h3>📏 Геометрические размеры карты</h3>
                <div class="dimensions-grid">
                    <div class="dim-item">
                        <div class="dim-label">Ширина (X)</div>
                        <div class="dim-value">${dimResult.props_x}</div>
                    </div>
                    <div class="dim-item">
                        <div class="dim-label">Длина (Y)</div>
                        <div class="dim-value">${dimResult.props_y}</div>
                    </div>
                    <div class="dim-item">
                        <div class="dim-label">Высота (Z)</div>
                        <div class="dim-value">${dimResult.props_z}</div>
                    </div>
                </div>
                <div style="font-size:0.75rem; color:#7c9bc2; margin-top:0.8rem;">
                    📐 Формула: (max-min)/500 + 1 для X/Y; (max-min)/500 для Z, округление вверх
                </div>
            </div>
        `;
    } else {
        html += `
            <div class="card">
                <h3>⚠️ Геометрия</h3>
                <div class="error-message">
                    Не удалось вычислить габариты. Убедитесь, что в XML присутствуют теги 
                    &lt;static-geometry&gt; с &lt;prop&gt;&lt;position&gt; и &lt;collision-geometry&gt; с collision-элементами.
                </div>
            </div>
        `;
    }
    
    // Блок бонусных регионов
    if (bonusResult) {
        const bonusCounts = bonusResult.bonus_counts;
        const totalBonuses = bonusResult.total;
        const hasBonuses = Object.keys(bonusCounts).length > 0;
        
        html += `<div class="card">
                    <h3>🎁 Бонус-регионы <span class="badge-total">режим: ${gameModeUsed}</span>
                    ${totalBonuses > 0 ? `<span class="badge-total">всего: ${totalBonuses}</span>` : ''}
                    </h3>`;
        if (hasBonuses) {
            html += `
                <table class="bonus-table">
                    <thead>
                        <tr><th>Тип бонуса</th><th>Количество</th></tr>
                    </thead>
                    <tbody>
            `;
            const sortedTypes = Object.keys(bonusCounts).sort();
            for (const btype of sortedTypes) {
                html += `<tr><td>🏷️ ${escapeHtml(btype)}</td><td><strong>${bonusCounts[btype]}</strong></td></tr>`;
            }
            html += `</tbody></table>`;
        } else {
            html += `<div class="empty-state" style="padding:1rem; text-align:left;">✨ Нет бонус-регионов для выбранного режима (${gameModeUsed}) или в XML отсутствуют подходящие &lt;bonus-region&gt;.</div>`;
        }
        html += `</div>`;
    } else {
        html += `
            <div class="card">
                <h3>🎁 Бонус-регионы</h3>
                <div class="empty-state">Не найдено ни одного тега &lt;bonus-region&gt; в XML файле.</div>
            </div>
        `;
    }
    
    // Дополнительная информация о файле
    html += `<div style="font-size:0.7rem; background:#07121c; border-radius:1rem; padding:0.5rem 1rem; color:#6082a0;">
                📄 Файл: ${escapeHtml(fileName)} | Анализ завершён
            </div>`;
    
    resultDiv.innerHTML = html;
}

// helper для экранирования
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    }).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, function(c) {
        return c;
    });
}

// главная функция обработки загруженного XML файла
async function processXMLFile(file, gameMode) {
    if (!file) {
        showError("Файл не выбран");
        return;
    }
    
    if (!file.name.toLowerCase().endsWith('.xml')) {
        showError("Пожалуйста, загрузите XML файл (расширение .xml)");
        return;
    }
    
    try {
        const text = await file.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "text/xml");
        
        // проверка ошибок парсинга
        const parseError = xmlDoc.querySelector('parsererror');
        if (parseError) {
            showError("Ошибка парсинга XML: " + parseError.textContent);
            return;
        }
        
        const filename = file.name;
        
        // 1. Габариты
        const dimResult = calculateDimensions(xmlDoc, filename);
        // 2. Бонусные регионы
        const bonusResult = analyzeBonusRegions(xmlDoc, gameMode, filename);
        
        // Отображаем результат
        renderResults(dimResult, bonusResult, gameMode, filename);
        
    } catch (err) {
        console.error(err);
        showError("Не удалось прочитать файл: " + err.message);
    }
}

function showError(msg) {
    const resultDiv = document.getElementById('resultArea');
    if (resultDiv) {
        resultDiv.innerHTML = `<div class="error-message" style="margin:1rem;">❌ ${escapeHtml(msg)}</div>`;
    } else {
        alert(msg);
    }
}

// ------ Инициализация UI и обработчики ------
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const fileNameSpan = document.getElementById('fileNameDisplay');
    const gameModeSelect = document.getElementById('gameMode');
    
    let selectedFile = null;
    
    fileInput.addEventListener('change', (e) => {
        if (fileInput.files && fileInput.files.length > 0) {
            selectedFile = fileInput.files[0];
            fileNameSpan.textContent = selectedFile.name;
            analyzeBtn.disabled = false;
            // очистить старые результаты при новом файле
            const resultDiv = document.getElementById('resultArea');
            if (resultDiv && !resultDiv.innerHTML.includes("Ожидание загрузки")) {
                resultDiv.innerHTML = `<div class="empty-state">📁 Новый файл: "${escapeHtml(selectedFile.name)}". Нажмите «Анализировать».</div>`;
            }
        } else {
            selectedFile = null;
            fileNameSpan.textContent = "Файл не выбран";
            analyzeBtn.disabled = true;
        }
    });
    
    analyzeBtn.addEventListener('click', async () => {
        if (!selectedFile) {
            showError("Сначала выберите XML файл.");
            return;
        }
        
        const currentGameMode = gameModeSelect.value;
        // Блокируем кнопку на время анализа (чтобы избежать повторных кликов)
        analyzeBtn.disabled = true;
        const originalText = analyzeBtn.innerHTML;
        analyzeBtn.innerHTML = "⏳ Анализ...";
        
        try {
            await processXMLFile(selectedFile, currentGameMode);
        } catch (err) {
            showError("Ошибка: " + err.message);
        } finally {
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = originalText;
        }
    });
    
    // Можно также разрешить drag and drop? (опционально, но для удобства добавим базовый)
    const container = document.querySelector('.container');
    const preventDefaults = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    const dropZone = document.querySelector('.upload-area');
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.background = '#2a4053';
    });
    dropZone.addEventListener('dragleave', () => {
        dropZone.style.background = '#1e2a36';
    });
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.background = '#1e2a36';
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files && files.length > 0) {
            const droppedFile = files[0];
            if (droppedFile.name.toLowerCase().endsWith('.xml')) {
                fileInput.files = dt.files;
                // вручную триггерим событие
                const changeEvent = new Event('change', { bubbles: true });
                fileInput.dispatchEvent(changeEvent);
            } else {
                showError("Пожалуйста, перетащите XML файл.");
            }
        }
    });
    
    // изначально показать подсказку
    const resultDiv = document.getElementById('resultArea');
    if (resultDiv && resultDiv.innerHTML.includes("Ожидание загрузки")) {
        // сохраняем приветствие
    }
});