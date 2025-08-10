class WellnessTracker {
    constructor() {
        this.state = {
            goals: [],
            notes: [],
            foodLog: []
        };
        
        this.init();
    }

    init() {
        // Load data from localStorage
        this.loadData();
        
        // Set up view navigation
        this.setupNavigation();
        
        // Set up form handlers
        this.setupFormHandlers();
        
        // Initial render
        this.render();
        
        // Register service worker
        this.registerServiceWorker();
    }

    loadData() {
        const savedData = localStorage.getItem('wellnessData');
        if (savedData) {
            this.state = JSON.parse(savedData);
        }
    }

    saveData() {
        localStorage.setItem('wellnessData', JSON.stringify(this.state));
    }

    setupNavigation() {
        const nav = document.querySelector('nav');
        nav.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                this.switchView(e.target.dataset.view);
            }
        });
    }

    setupFormHandlers() {
        // Goals form
        document.getElementById('goal-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const input = document.getElementById('new-goal');
            this.addGoal(input.value);
            input.value = '';
        });

        // Notes form
        document.getElementById('note-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const input = document.getElementById('note-content');
            this.addNote(input.value);
            input.value = '';
        });

        // Food log form
        document.getElementById('food-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const foodItem = document.getElementById('food-item');
            const foodTime = document.getElementById('food-time');
            this.addFoodLog(foodItem.value, foodTime.value);
            foodItem.value = '';
            foodTime.value = '';
        });
    }

    switchView(viewId) {
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        document.querySelectorAll('nav button').forEach(btn => {
            btn.classList.remove('active');
        });
        
        document.getElementById(viewId).classList.add('active');
        document.querySelector(`[data-view="${viewId}"]`).classList.add('active');
    }

    addGoal(text) {
        if (!text.trim()) return;
        this.state.goals.push({
            id: Date.now(),
            text,
            completed: false
        });
        this.saveData();
        this.render();
    }

    addNote(content) {
        if (!content.trim()) return;
        this.state.notes.push({
            id: Date.now(),
            content,
            timestamp: new Date().toISOString()
        });
        this.saveData();
        this.render();
    }

    addFoodLog(item, time) {
        if (!item.trim() || !time) return;
        this.state.foodLog.push({
            id: Date.now(),
            item,
            time,
            date: new Date().toISOString().split('T')[0]
        });
        this.saveData();
        this.render();
    }

    deleteItem(type, id) {
        this.state[type] = this.state[type].filter(item => item.id !== id);
        this.saveData();
        this.render();
    }

    toggleGoal(id) {
        const goal = this.state.goals.find(g => g.id === id);
        if (goal) {
            goal.completed = !goal.completed;
            this.saveData();
            this.render();
        }
    }

    render() {
        // Render goals
        const goalsList = document.getElementById('goals-list');
        goalsList.innerHTML = this.state.goals
            .map(goal => `
                <li>
                    <label>
                        <input type="checkbox" 
                               ${goal.completed ? 'checked' : ''} 
                               onchange="app.toggleGoal(${goal.id})">
                        <span style="${goal.completed ? 'text-decoration: line-through' : ''}">${goal.text}</span>
                    </label>
                    <button class="delete-btn" onclick="app.deleteItem('goals', ${goal.id})">Delete</button>
                </li>
            `).join('');

        // Render notes
        const notesList = document.getElementById('notes-list');
        notesList.innerHTML = this.state.notes
            .map(note => `
                <div class="note">
                    <p>${note.content}</p>
                    <small>${new Date(note.timestamp).toLocaleString()}</small>
                    <button class="delete-btn" onclick="app.deleteItem('notes', ${note.id})">Delete</button>
                </div>
            `).join('');

        // Render food log
        const foodList = document.getElementById('food-list');
        foodList.innerHTML = this.state.foodLog
            .map(food => `
                <li>
                    <span>${food.item} - ${food.time}</span>
                    <button class="delete-btn" onclick="app.deleteItem('foodLog', ${food.id})">Delete</button>
                </li>
            `).join('');
    }

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                await navigator.serviceWorker.register('./sw.js');
                console.log('Service Worker registered successfully');
            } catch (error) {
                console.error('ServiceWorker registration failed:', error);
            }
        }
    }
}

// Initialize the app
const app = new WellnessTracker(); 