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

  async init() {
    if (this.initialized) return;
    
    try {
      await fs.mkdir(this.dir, { recursive: true });
      try {
        await this._read();
      } catch (error) {
        await fs.writeFile(this.file, JSON.stringify({ resources: [] }));
      }
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize ResourceService:', error);
      throw error;
    }
  }

  async _read() {
    try {
      const data = await fs.readFile(this.file, 'utf8');
      const parsed = JSON.parse(data);
      parsed.resources = Array.isArray(parsed.resources) ? parsed.resources : [];
      return parsed;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return { resources: [] };
      }
      console.warn('Database file corrupted, recreating...', error);
      await fs.writeFile(this.file, JSON.stringify({ resources: [] }));
      return { resources: [] };
    }
  }

  async _write(data) {
    const tmpFile = `${this.file}.tmp`;
    const content = JSON.stringify(data, null, 2);
    
    try {
      await fs.writeFile(tmpFile, content);
      await fs.rename(tmpFile, this.file);
    } catch (error) {
      try { await fs.unlink(tmpFile); } catch (e) {}
      throw error;
    }
  }

  // FIXED: Better duplicate detection
  async findDuplicate(url) {
    await this.init();
    const data = await this._read();
    
    const normalizedUrl = this.normalizeUrl(url);
    
    return data.resources.find(resource => 
      this.normalizeUrl(resource.url) === normalizedUrl
    );
  }

  normalizeUrl(url) {
    // More comprehensive URL normalization
    return url.toLowerCase()
      .replace(/^https?:\/\/(www\.)?/, '') // Remove http/https and www
      .replace(/\/$/, '') // Remove trailing slash
      .split('?')[0] // Remove query parameters
      .split('#')[0]; // Remove fragments
  }

  // FIXED: Better add resource with proper duplicate handling
  async addResource(url, description = '', userId = null, userCategory = '') {
    await this.init();
    
    // Check for duplicate FIRST
    const existingResource = await this.findDuplicate(url);
    
    if (existingResource) {
      // Update existing resource - preserve original category if no new category provided
      const updates = { 
        description,
        updated_at: new Date().toISOString()
      };
      
      // Only update category if user explicitly provided one
      if (userCategory && userCategory.trim()) {
        updates.category = userCategory.toLowerCase();
      }
      
      return this.updateResource(existingResource.id, updates);
    }

    // If no duplicate, add new resource
    const data = await this._read();
    const category = userCategory 
      ? userCategory.toLowerCase() 
      : this.categorizer.categorize(description);

    const newResource = {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      category,
      url: url.startsWith('http') ? url : `https://${url}`,
      description,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    data.resources.push(newResource);
    await this._write(data);

    return { 
      action: 'added', 
      category, 
      id: newResource.id,
      message: `✅ Resource added to category: ${category}`
    };
  }

  async updateResource(id, updates) {
    await this.init();
    const data = await this._read();
    
    const resourceIndex = data.resources.findIndex(r => r.id === id);
    if (resourceIndex === -1) {
      throw new Error('Resource not found');
    }

    data.resources[resourceIndex] = {
      ...data.resources[resourceIndex],
      ...updates
    };

    await this._write(data);

    return {
      action: 'updated',
      id,
      category: data.resources[resourceIndex].category,
      message: `✅ Resource updated in category: ${data.resources[resourceIndex].category}`
    };
  }

  // FIXED: Better semantic search
  async semanticSearch(query, limit = 10) {
    await this.init();
    
    if (!query || query.trim() === '') {
      return this.getAllResources(limit);
    }

    const data = await this._read();
    const searchTerm = query.toLowerCase().trim();
    
    // 1. First try exact matches in description, category, and URL
    let results = data.resources.filter(r =>
      (r.description || '').toLowerCase().includes(searchTerm) ||
      (r.category || '').toLowerCase() === searchTerm ||
      (r.url || '').toLowerCase().includes(searchTerm)
    );

    // 2. If no exact matches, try semantic category mapping
    if (results.length === 0) {
      const semanticCategories = this.categorizer.findSemanticCategories(searchTerm);
      
      if (semanticCategories.length > 0) {
        results = data.resources.filter(r =>
          semanticCategories.includes(r.category)
        );
      }
    }

    // 3. If still no results, try partial matches
    if (results.length === 0) {
      results = data.resources.filter(r =>
        (r.description || '').toLowerCase().includes(searchTerm) ||
        (r.category || '').toLowerCase().includes(searchTerm)
      );
    }

    return results
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit)
      .map(({ url, description, category }) => ({ url, description, category }));
  }

  // NEW: Get all resources for empty search
  async getAllResources(limit = 20) {
    await this.init();
    const data = await this._read();
    
    return data.resources
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

  // NEW: Get resources by specific category
  async getResourcesByCategory(category, limit = 10) {
    await this.init();
    const data = await this._read();
    
    return data.resources
      .filter(r => r.category === category)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit)
      .map(({ url, description }) => ({ url, description }));
  }
}

module.exports = ResourceService;
