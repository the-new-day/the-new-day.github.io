function calculateWidthAndLength(staticGeomElement) {
    if (!staticGeomElement) return null;

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

function calculateHeight(collisionGeomElement) {
    if (!collisionGeomElement) return null;

    const allZ = [];

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

    const planes = collisionGeomElement.querySelectorAll('collision-plane');
    for (const plane of planes) {
        const position = plane.querySelector('position');
        if (!position) continue;
        const posZ = parseFloat(position.querySelector('z')?.textContent);
        if (!isNaN(posZ)) allZ.push(posZ);
    }

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

function analyzeBonusRegions(xmlDoc, targetGameMode, filename) {
    const root = xmlDoc.documentElement;
    if (!root) return null;

    const bonusRegions = root.querySelectorAll('bonus-region');
    if (bonusRegions.length === 0) return null;

    const bonusTypes = [];

    for (const region of bonusRegions) {
        const gameModes = region.querySelectorAll('game-mode');
        if (gameModes.length === 0) continue;

        let modeMatch = false;
        for (const gm of gameModes) {
            const modeText = gm.textContent?.trim();
            if (modeText === targetGameMode) {
                modeMatch = true;
                break;
            }
        }
        if (!modeMatch) continue;

        const bonusTypeElems = region.querySelectorAll('bonus-type');
        for (const bonusTypeElem of bonusTypeElems) {
            if (bonusTypeElem.textContent) {
                const bonusType = bonusTypeElem.textContent.trim();
                if (bonusType) {
                    bonusTypes.push(bonusType);
                }
            }
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

function renderResults(dimResult, bonusResult, gameModeUsed, fileName) {
    const resultDiv = document.getElementById('resultArea');
    if (!resultDiv) return;

    let html = '';

    if (dimResult && dimResult.props_x !== undefined) {
        html += `
            <div class="card">
                <h3>Geometric map sizes</h3>
                <div class="dimensions-grid">
                    <div class="dim-item">
                        <div class="dim-label">Width (X)</div>
                        <div class="dim-value">${dimResult.props_x}</div>
                    </div>
                    <div class="dim-item">
                        <div class="dim-label">Length (Y)</div>
                        <div class="dim-value">${dimResult.props_y}</div>
                    </div>
                    <div class="dim-item">
                        <div class="dim-label">Height (Z)</div>
                        <div class="dim-value">${dimResult.props_z}</div>
                    </div>
                </div>
                <div style="font-size:0.75rem; color:#7c9bc2; margin-top:0.8rem;">
                    Formula: (max-min)/500 + 1 for X/Y; (max-min)/500 for Z, round up
                </div>
            </div>
        `;
    } else {
        html += `
            <div class="card">
                <h3>Geometry</h3>
                <div class="error-message">
                    Failed to calculate sizes. XML must contain tags
                    &lt;static-geometry&gt; с &lt;prop&gt;&lt;position&gt; и &lt;collision-geometry&gt; with collision-elements.
                </div>
            </div>
        `;
    }

    if (bonusResult) {
        const bonusCounts = bonusResult.bonus_counts;
        const totalBonuses = bonusResult.total;
        const hasBonuses = Object.keys(bonusCounts).length > 0;

        html += `<div class="card">
                    <h3>Bonus regions <span class="badge-total">mode: ${gameModeUsed}</span>
                    ${totalBonuses > 0 ? `<span class="badge-total">Total: ${totalBonuses}</span>` : ''}
                    </h3>`;
        if (hasBonuses) {
            html += `
                <table class="bonus-table">
                    <thead>
                        <tr><th>Bonus type</th><th>Amount</th></tr>
                    </thead>
                    <tbody>
            `;
            const sortedTypes = Object.keys(bonusCounts).sort();
            for (const btype of sortedTypes) {
                html += `<tr><td>🏷️ ${escapeHtml(btype)}</td><td><strong>${bonusCounts[btype]}</strong></td></tr>`;
            }
            html += `</tbody></table>`;
        } else {
            html += `<div class="empty-state" style="padding:1rem; text-align:left;">No bonus regions for mode (${gameModeUsed})</div>`;
        }
        html += `</div>`;
    } else {
        html += `
            <div class="card">
                <h3>Bonus regions</h3>
                <div class="empty-state">Not &lt;bonus-region&gt; tags found in the XML file.</div>
            </div>
        `;
    }

    html += `<div style="font-size:0.7rem; background:#07121c; border-radius:1rem; padding:0.5rem 1rem; color:#6082a0;">
                File: ${escapeHtml(fileName)} | Calculation finished
            </div>`;

    resultDiv.innerHTML = html;
}

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

async function processXMLFile(file, gameMode) {
    if (!file) {
        showError("No file selected");
        return;
    }

    if (!file.name.toLowerCase().endsWith('.xml')) {
        showError("Upload .xml file pls");
        return;
    }

    try {
        const text = await file.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "text/xml");

        const parseError = xmlDoc.querySelector('parsererror');
        if (parseError) {
            showError("XML parsing error: " + parseError.textContent);
            return;
        }

        const filename = file.name;

        const dimResult = calculateDimensions(xmlDoc, filename);

        const bonusResult = analyzeBonusRegions(xmlDoc, gameMode, filename);

        renderResults(dimResult, bonusResult, gameMode, filename);

    } catch (err) {
        console.error(err);
        showError("Failed to read the file: " + err.message);
    }
}

function showError(msg) {
    const resultDiv = document.getElementById('resultArea');
    if (resultDiv) {
        resultDiv.innerHTML = `<div class="error-message" style="margin:1rem;">${escapeHtml(msg)}</div>`;
    } else {
        alert(msg);
    }
}

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

            const resultDiv = document.getElementById('resultArea');
            if (resultDiv && !resultDiv.innerHTML.includes("Ожидание загрузки")) {
                resultDiv.innerHTML = `<div class="empty-state">New file: "${escapeHtml(selectedFile.name)}". Press "Calculate"</div>`;
            }
        } else {
            selectedFile = null;
            fileNameSpan.textContent = "No file selected";
            analyzeBtn.disabled = true;
        }
    });

    analyzeBtn.addEventListener('click', async () => {
        if (!selectedFile) {
            showError("Select XML file first.");
            return;
        }

        const currentGameMode = gameModeSelect.value;

        analyzeBtn.disabled = true;
        const originalText = analyzeBtn.innerHTML;
        analyzeBtn.innerHTML = "Calculation...";

        try {
            await processXMLFile(selectedFile, currentGameMode);
        } catch (err) {
            showError("Error: " + err.message);
        } finally {
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = originalText;
        }
    });

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

                const changeEvent = new Event('change', { bubbles: true });
                fileInput.dispatchEvent(changeEvent);
            } else {
                showError("Please drag and drop XML file.");
            }
        }
    });

    const resultDiv = document.getElementById('resultArea');
    if (resultDiv && resultDiv.innerHTML.includes("Awaiting for the upload...")) {

    }
});
