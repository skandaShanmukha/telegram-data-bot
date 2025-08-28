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
        parsed.jobs = Array.isArray(parsed.jobs) ? parsed.jobs : []; // Ensure jobs array exists
        return parsed;
    } catch (error) {
        if (error.code === 'ENOENT') {
            return { resources: [], jobs: [] }; // Include jobs in default structure
        }
        console.warn('Database file corrupted, recreating...', error);
        await fs.writeFile(this.file, JSON.stringify({ resources: [], jobs: [] }));
        return { resources: [], jobs: [] };
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


  // JOB POSTING METHODS
  async addJob(title, official_url, start_date, end_date, description, userId = null) {
    await this.init();
    const data = await this._read();

    // Ensure jobs array exists
    if (!data.jobs) {
      data.jobs = [];
    }

    const newJob = {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      title,
      official_url: official_url.startsWith('http') ? official_url : `https://${official_url}`,
      start_date: this.parseDate(start_date),
      end_date: this.parseDate(end_date),
      description,
      posted_by: userId,
      created_at: new Date().toISOString(),
      status: 'active'
    };

    data.jobs.push(newJob);
    await this._write(data);

    return { 
      id: newJob.id,
      message: `✅ Job posting added: ${title}`
    };
  }


  async getAllJobs() {
    await this.init();
    const data = await this._read();
    return data.jobs || [];
  }

  async getAllActiveJobs() {
    await this.init();
    const data = await this._read();
    
    console.log('📊 Total jobs in DB:', data.jobs ? data.jobs.length : 0);
    
    if (!data.jobs || data.jobs.length === 0) {
        console.log('No jobs array or empty jobs array');
        return [];
    }

    const now = new Date();
    console.log('Current time:', now.toISOString());
    
    const activeJobs = data.jobs.filter(job => {
        if (job.status !== 'active') {
            console.log('Job not active:', job.title);
            return false;
        }
        
        const endDate = new Date(job.end_date);
        console.log(`Job: ${job.title}, End Date: ${endDate.toISOString()}, Now: ${now.toISOString()}`);
        
        const isActive = endDate > now;
        console.log(`Is active: ${isActive}`);
        
        return isActive;
    });
    
    console.log('✅ Active jobs after filtering:', activeJobs.length);
    return activeJobs;
   }

  async getJobsEndingSoon() {
    await this.init();
    const data = await this._read();
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    if (!data.jobs) return [];

    return data.jobs.filter(job => 
      job.status === 'active' && 
      new Date(job.end_date) > now &&
      new Date(job.end_date) <= sevenDaysFromNow
    );
  }

  async getJobsStartingSoon() {
    await this.init();
    const data = await this._read();
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    if (!data.jobs) return [];

    return data.jobs.filter(job => 
      job.status === 'active' && 
      new Date(job.start_date) > now &&
      new Date(job.start_date) <= sevenDaysFromNow
    );
  }

  parseDate(dateString) {
    try {
        // Remove any quotes or extra spaces
        dateString = dateString.replace(/['"]/g, '').trim();
        
        const parts = dateString.split(/[-/]/);
        if (parts.length !== 3) {
            throw new Error('Invalid date format');
        }

        let day, month, year;

        // Handle DD-MM-YYYY or DD/MM/YYYY format
        if (parts[0].length <= 2 && parts[2].length === 4) {
            day = parseInt(parts[0]);
            month = parseInt(parts[1]) - 1; // Months are 0-indexed in JavaScript
            year = parseInt(parts[2]);
        }
        // Handle YYYY-MM-DD format
        else if (parts[0].length === 4 && parts[2].length <= 2) {
            year = parseInt(parts[0]);
            month = parseInt(parts[1]) - 1;
            day = parseInt(parts[2]);
        }
        else {
            throw new Error('Unrecognized date format');
        }

        // Validate date components
        if (isNaN(day) || isNaN(month) || isNaN(year)) {
            throw new Error('Invalid date numbers');
        }

        if (day < 1 || day > 31) throw new Error('Invalid day');
        if (month < 0 || month > 11) throw new Error('Invalid month');
        if (year < 2000 || year > 2100) throw new Error('Invalid year');

        const date = new Date(Date.UTC(year, month, day));
        
        if (isNaN(date.getTime())) {
            throw new Error('Invalid date');
        }

        return date.toISOString();
    } catch (error) {
        console.error('Date parsing error:', error.message, 'for date:', dateString);
        throw new Error(`Invalid date format: ${dateString}. Use DD-MM-YYYY or YYYY-MM-DD`);
    }
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

}

module.exports = ResourceService;
