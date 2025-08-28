const fs = require('fs').promises;
const path = require('path');
const CategorizationEngine = require('./CategorizationEngine');

class ResourceService {
  constructor() {
    this.file = path.join(__dirname, '../../data/bot.json');
    this.dir = path.dirname(this.file);
    this.categorizer = new CategorizationEngine();
    this.initialized = false;
  }

  // Async initialization to avoid blocking
  async init() {
    if (this.initialized) return;
    
    try {
      await fs.mkdir(this.dir, { recursive: true });
      try {
        // Try to read to check if file exists and is valid JSON
        await this._read();
      } catch (error) {
        // File doesn't exist or is corrupt, create fresh
        await fs.writeFile(this.file, JSON.stringify({ resources: [] }));
      }
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize ResourceService:', error);
      throw error;
    }
  }

  // Simplified read with better error handling
  async _read() {
    try {
      const data = await fs.readFile(this.file, 'utf8');
      const parsed = JSON.parse(data);
      
      // Validate structure
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Invalid JSON structure');
      }
      
      parsed.resources = Array.isArray(parsed.resources) ? parsed.resources : [];
      return parsed;
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, return empty structure
        return { resources: [] };
      }
      
      // For corruption or other errors, recreate file
      console.warn('Database file corrupted, recreating...', error);
      await fs.writeFile(this.file, JSON.stringify({ resources: [] }));
      return { resources: [] };
    }
  }

  // Simplified atomic write
  async _write(data) {
    const tmpFile = `${this.file}.tmp`;
    const content = JSON.stringify(data, null, 2);
    
    try {
      // Write to temp file first
      await fs.writeFile(tmpFile, content);
      // Atomic rename (this is atomic on most filesystems)
      await fs.rename(tmpFile, this.file);
    } catch (error) {
      // Clean up temp file if rename failed
      try { await fs.unlink(tmpFile); } catch (e) {}
      throw error;
    }
  }

  // Public methods with initialization check
  async addResource(url, description = '', userId = null, userCategory = '') {
    await this.init();
    
    const data = await this._read();
    const category = userCategory 
      ? userCategory.toLowerCase() 
      : this.categorizer.categorize(description);

    const newResource = {
      id: Date.now() + Math.random().toString(36).substr(2, 9), // More unique ID
      category,
      url: url.startsWith('http') ? url : `https://${url}`,
      description,
      user_id: userId,
      created_at: new Date().toISOString(),
    };

    data.resources.push(newResource);
    await this._write(data);

    return { category, added: true, id: newResource.id };
  }

  async getResourcesByCategory(category, limit = 10) {
    await this.init();
    
    const data = await this._read();
    return data.resources
      .filter(r => r.category === category)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit)
      .map(({ url, description }) => ({ url, description }));
  }

  async searchResources(query, limit = 10) {
    await this.init();
    
    const q = query.toLowerCase();
    const data = await this._read();
    
    return data.resources
      .filter(r => 
        (r.description || '').toLowerCase().includes(q) ||
        (r.category || '').toLowerCase().includes(q)
      )
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit)
      .map(({ url, description, category }) => ({ url, description, category }));
  }

  async getAllCategories() {
    await this.init();
    
    const data = await this._read();
    const categories = [...new Set(data.resources.map(r => r.category).filter(Boolean))];
    return categories.sort();
  }

  // Optional: Add cleanup method for old entries
  async cleanupOldEntries(maxAgeDays = 30) {
    await this.init();
    
    const data = await this._read();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - maxAgeDays);
    
    data.resources = data.resources.filter(
      r => new Date(r.created_at) > cutoff
    );
    
    await this._write(data);
  }
}

module.exports = ResourceService;
