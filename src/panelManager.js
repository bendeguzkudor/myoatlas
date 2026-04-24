// Panel management: dragging, positioning, collapsing
export class PanelManager {
  constructor() {
    this.panels = new Map();
    this.activePanel = null;
  }

  registerPanel(panelId, defaultPosition = { x: 20, y: 80 }) {
    const panel = document.getElementById(panelId);
    if (!panel) return;

    const panelState = {
      element: panel,
      isDragging: false,
      isCollapsed: false,
      position: { ...defaultPosition },
      dragOffset: { x: 0, y: 0 },
    };

    // Add drag handle
    const header = panel.querySelector('.panel-header');
    if (header) {
      header.addEventListener('mousedown', (e) => this.startDrag(panelId, e));
    }

    // Add collapse toggle
    const collapseBtn = panel.querySelector('.panel-collapse');
    if (collapseBtn) {
      collapseBtn.addEventListener('click', () => this.toggleCollapse(panelId));
    }

    // Add close button
    const closeBtn = panel.querySelector('.panel-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hidePanel(panelId));
    }

    this.panels.set(panelId, panelState);
    this.updatePanelPosition(panelId);
  }

  startDrag(panelId, event) {
    // Don't drag on interactive elements
    if (event.target.closest('button, input, select, a')) return;

    const panel = this.panels.get(panelId);
    panel.isDragging = true;
    panel.dragOffset.x = event.clientX - panel.position.x;
    panel.dragOffset.y = event.clientY - panel.position.y;

    this.activePanel = panelId;
    panel.element.classList.add('dragging');

    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  }

  onMouseMove = (event) => {
    if (!this.activePanel) return;
    const panel = this.panels.get(this.activePanel);
    if (!panel.isDragging) return;

    panel.position.x = event.clientX - panel.dragOffset.x;
    panel.position.y = event.clientY - panel.dragOffset.y;

    // Keep within viewport bounds
    const maxX = window.innerWidth - panel.element.offsetWidth - 20;
    const maxY = window.innerHeight - panel.element.offsetHeight - 20;
    panel.position.x = Math.max(20, Math.min(panel.position.x, maxX));
    panel.position.y = Math.max(80, Math.min(panel.position.y, maxY)); // 80px below top bar

    this.updatePanelPosition(this.activePanel);
  };

  onMouseUp = () => {
    if (!this.activePanel) return;
    const panel = this.panels.get(this.activePanel);
    panel.isDragging = false;
    panel.element.classList.remove('dragging');
    this.activePanel = null;

    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  };

  updatePanelPosition(panelId) {
    const panel = this.panels.get(panelId);
    panel.element.style.transform = `translate(${panel.position.x}px, ${panel.position.y}px)`;
  }

  toggleCollapse(panelId) {
    const panel = this.panels.get(panelId);
    panel.isCollapsed = !panel.isCollapsed;
    panel.element.classList.toggle('collapsed', panel.isCollapsed);
  }

  showPanel(panelId) {
    const panel = this.panels.get(panelId);
    if (panel) {
      panel.element.classList.add('visible');
    }
  }

  hidePanel(panelId) {
    const panel = this.panels.get(panelId);
    if (panel) {
      panel.element.classList.remove('visible');
    }
  }
}
