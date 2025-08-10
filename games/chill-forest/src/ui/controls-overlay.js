export function createControlsOverlay() {
    const controlsDiv = document.createElement('div');
    controlsDiv.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.6);
        color: white;
        padding: 15px;
        border-radius: 8px;
        font-family: Arial, sans-serif;
        font-size: 14px;
        pointer-events: none;
        z-index: 1000;
        line-height: 1.5;
    `;

    controlsDiv.innerHTML = `
        <div style="margin-bottom: 10px; font-weight: bold;">Controls:</div>
        <div style="margin-bottom: 15px;">
            <div style="color: #aaffaa;">Movement:</div>
            <div>W - Move Forward</div>
            <div>S - Move Backward</div>
            <div>A - Move Left</div>
            <div>D - Move Right</div>
        </div>
        <div>
            <div style="color: #aaffaa;">Camera:</div>
            <div>🖱️ Left Click + Drag - Pan View</div>
            <div>🖱️ Right Click + Drag - Rotate View</div>
            <div>🖱️ Scroll - Zoom</div>
        </div>
    `;

    document.body.appendChild(controlsDiv);
}