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

  // Check if URL already exists and return existing resource
  async findDuplicate(url) {
    await this.init();
    const data = await this._read();
    
    // Normalize URL for comparison (remove protocol, www, etc.)
    const normalizedUrl = this.normalizeUrl(url);
    
    return data.resources.find(resource => 
      this.normalizeUrl(resource.url) === normalizedUrl
    );
  }

  normalizeUrl(url) {
    return url.toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, ''); // Remove trailing slash
  }

  async addResource(url, description = '', userId = null, userCategory = '') {
    await this.init();
    
    // Check for duplicate
    const existingResource = await this.findDuplicate(url);
    if (existingResource) {
      // Update existing resource instead of adding new one
      return this.updateResource(existingResource.id, { description, category: userCategory });
    }

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

    // Update resource
    data.resources[resourceIndex] = {
      ...data.resources[resourceIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };

    await this._write(data);

    return {
      action: 'updated',
      id,
      category: data.resources[resourceIndex].category,
      message: `✅ Resource updated in category: ${data.resources[resourceIndex].category}`
    };
  }

  // Unified search that understands semantic intent
  async semanticSearch(query, limit = 10) {
    await this.init();
    
    const data = await this._read();
    const searchTerm = query.toLowerCase();
    
    // 1. First try exact matches
    let results = data.resources.filter(r =>
      (r.description || '').toLowerCase().includes(searchTerm) ||
      (r.category || '').toLowerCase().includes(searchTerm) ||
      (r.url || '').toLowerCase().includes(searchTerm)
    );

    // 2. If no exact matches, try semantic categories
    if (results.length === 0) {
      const semanticCategories = this.categorizer.findSemanticCategories(searchTerm);
      
      if (semanticCategories.length > 0) {
        results = data.resources.filter(r =>
          semanticCategories.includes(r.category)
        );
      }
    }

    // 3. Sort by relevance (recent first)
    return results
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
}

module.exports = ResourceService;
