const sqlite3 = require('sqlite3').verbose();
const CategorizationEngine = require('./CategorizationEngine');

class ResourceService {
    constructor() {
        this.db = new sqlite3.Database('bot.db');
        this.categorizer = new CategorizationEngine();
        this.initializeDatabase();
    }

    initializeDatabase() {
        this.db.serialize(() => {
            this.db.run(`CREATE TABLE IF NOT EXISTS resources (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                category TEXT NOT NULL,
                url TEXT NOT NULL,
                description TEXT,
                user_id INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);
            
            // Create index for better performance
            this.db.run(`CREATE INDEX IF NOT EXISTS idx_category ON resources(category)`);
        });
    }

    async addResource(url, description, userId, userCategory = '') {
        // If user provided a category, use it, otherwise auto-categorize
        const category = userCategory ? userCategory.toLowerCase() : this.categorizer.categorize(description);
        
        return new Promise((resolve, reject) => {
            this.db.run(
                `INSERT INTO resources (category, url, description, user_id) 
                 VALUES (?, ?, ?, ?)`,
                [category, url, description, userId],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ category, changes: this.changes });
                    }
                }
            );
        });
    }

    async getResourcesByCategory(category, limit = 10) { // Increased limit to 10
        return new Promise((resolve, reject) => {
            this.db.all(
                `SELECT url, description FROM resources 
                 WHERE category = ? 
                 ORDER BY created_at DESC 
                 LIMIT ?`,
                [category, limit],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

    async searchResources(query, limit = 10) { // Increased limit to 10
        return new Promise((resolve, reject) => {
            this.db.all(
                `SELECT url, description, category FROM resources 
                 WHERE description LIKE ? OR category LIKE ?
                 ORDER BY created_at DESC 
                 LIMIT ?`,
                [`%${query}%`, `%${query}%`, limit],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

    // New method to get all categories
    async getAllCategories() {
      return new Promise((resolve, reject) => {
        this.db.all(
            `SELECT DISTINCT category FROM resources ORDER BY category`,
            (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    // Handle case where rows might be empty or undefined
                    const categories = rows ? rows.map(row => row.category) : [];
                    resolve(categories);
                }
            }
        );
      });
    }

}

module.exports = ResourceService;
